import type { BunSai, BunsaiConfig } from "../core";
import type { Attributes } from "../core/attrs";
import { buildClient, type ClientBuild } from "../core/build";
import { createResult } from "../core/create-result";
import { CurrentBunSai, CurrentClientBuild, IsDev } from "../core/globals";
import type { Module, ModuleRenderResult } from "../core/module";
import { normalizeConfig } from "../core/normalize-config";
import { registry } from "../core/register";
import { join } from "path";

export type WarmupResult = Array<
  [
    Module<any>,
    {
      attrs: Attributes;
      render: ModuleRenderResult;
    }
  ]
>;

export interface BuilderArgs {
  /**
   * Default: get modules from registry
   */
  modules?: Module<any>[];
  /**
   * @default "./dist"
   */
  outFolder?: string;
  programEntrypoint: string;
  config: BunsaiConfig;
}

export class Builder implements BuilderArgs {
  modules: Module<any>[];
  programEntrypoint: string;
  clientBuild: ClientBuild | null = null;
  bunsai: BunSai | null = null;
  config: Required<BunsaiConfig>;
  outFolder: string;

  private constructor(args: BuilderArgs) {
    this.programEntrypoint = args.programEntrypoint;
    this.config = normalizeConfig(args.config);
    this.modules = args.modules || Array.from(registry.values());
    this.outFolder = args.outFolder || "./dist";

    if (this.modules.length == 0) throw new Error("empty BunSai registry");
  }

  async init() {
    IsDev(false);
    process.env.NODE_ENV = "production";

    const build = await buildClient(this.config.prefix, this.config.root);

    if (!build) throw new Error("build client failed");

    this.clientBuild = build;

    this.bunsai = createResult(
      this.clientBuild,
      this.config.prefix,
      this.config.root,
      this.config.defaults.attrs
    );

    CurrentClientBuild(this.clientBuild);
    CurrentBunSai(this.bunsai);
  }

  warmModules() {
    const result: WarmupResult = [];

    for (const module of this.modules) {
      const attrs = {} as Attributes;

      const data = {
        attrs,
        render: module.$m_render({
          isServer: true,
          attrs,
          context: {},
          step: "build",
        }),
      };

      if (data.render.css) module.$m_meta.css = data.render.css;

      result.push([module, data]);
    }

    return result;
  }

  async generate() {
    const { entries, extra } = this.clientBuild!;

    for (const [modulo, data] of this.warmModules()) {
      const moduloClientPath = entries.get(modulo.$m_meta.path);

      if (!moduloClientPath)
        throw new Error(`could not get client for '${modulo.$m_meta.path}'`);

      const { object, path } = moduloClientPath;

      await Bun.write(join(this.outFolder, path), object());
      await Bun.write(
        join(this.outFolder, path + ".render-data.json"),
        JSON.stringify({ modulo, data })
      );
    }

    for (const { object, path } of extra) {
      await Bun.write(join(this.outFolder, path), object());
    }

    await Bun.write(
      join(this.outFolder, "./bunsai-build.json"),
      JSON.stringify({
        config: this.config,
        modules: this.modules.map(({ $m_meta, $m_static }) => ({
          isStatic: $m_static,
          source: $m_meta.path,
          path: entries.get($m_meta.path)!.path,
          cssHash: $m_meta.cssHash,
        })),
        files: this.bunsai!.declarations.map(({ path }) => path),
      })
    );
  }

  static async build(args: BuilderArgs) {
    const self = new this(args);

    await self.init();

    await self.generate();
  }
}

import type { BunSai, BunsaiConfig } from "../core";
import type { Attributes } from "../core/attrs";
import { buildClient, type ClientBuild } from "../core/build";
import { createResult } from "../core/create-result";
import { CurrentBunSai, CurrentClientBuild, IsDev } from "../core/globals";
import type { Module, ModuleRenderResult } from "../core/module";
import { normalizeConfig } from "../core/normalize-config";
import { registry } from "../core/register";
import { join, resolve } from "path";
import { log, time } from "../core/util";

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

const renderDataSuffix = ".render-data.json";
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

  async generate(warmResult: WarmupResult) {
    const { entries, extra } = this.clientBuild!;

    const modules: {
      isStatic: boolean;
      source: string;
      path: string;
      cssHash: string;
      renderData: string;
    }[] = [];

    const files: string[] = [];

    for (const [modulo, data] of warmResult) {
      const moduloClientPath = entries.get(modulo.$m_meta.path);

      if (!moduloClientPath)
        throw new Error(`could not get client for '${modulo.$m_meta.path}'`);

      const { object, path } = moduloClientPath;

      const source = resolve(join(this.outFolder, path));
      const renderData = source + renderDataSuffix;

      modules.push({
        isStatic: modulo.$m_static,
        source,
        path,
        cssHash: modulo.$m_meta.cssHash,
        renderData,
      });

      await Bun.write(source, object());
      await Bun.write(renderData, JSON.stringify({ data }));
    }

    for (const { object, path } of extra) {
      const outPath = resolve(join(this.outFolder, path));
      files.push(outPath);
      await Bun.write(outPath, object());
    }

    await Bun.write(
      join(this.outFolder, "./bunsai-build.json"),
      JSON.stringify({
        config: this.config,
        modules,
        files,
      })
    );
  }

  static async build(args: BuilderArgs) {
    log.loud("creating final build");

    const bt = time.loud("final build");

    const self = new this(args);

    log.loud("initiating build");

    await self.init();

    log.loud("warming up modules");

    const warmResult = self.warmModules();

    log.loud("generating output");

    await self.generate(warmResult);

    bt();
  }
}

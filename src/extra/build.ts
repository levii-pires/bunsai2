import type { BunSai, BunsaiConfig } from "../core";
import type { Attributes } from "../core/attrs";
import { buildClient, type ClientBuild } from "../core/build";
import { createResult } from "../core/create-result";
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
  programEntrypoint: string;
  outFolder: string;
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
    this.outFolder = args.outFolder;

    if (this.modules.length == 0) throw new Error("empty BunSai registry");
  }

  async init() {
    const build = await buildClient(this.config.prefix, this.config.root);

    if (!build) throw new Error("build client failed");

    this.clientBuild = build;

    this.bunsai = createResult(
      this.clientBuild,
      this.config.prefix,
      this.config.root,
      this.config.defaults.attrs
    );
  }

  warmModules() {
    const result: WarmupResult = [];

    for (const module of this.modules) {
      const attrs = {} as Attributes;

      result.push([
        module,
        {
          attrs,
          render: module.$m_render({
            isServer: true,
            attrs,
            context: {},
            step: "build",
          }),
        },
      ]);
    }

    return result;
  }

  static async build(args: BuilderArgs) {
    const self = new this(args);

    await self.init();

    const warmResult = self.warmModules();

    // self.bunsai!. todo: finish
  }
}

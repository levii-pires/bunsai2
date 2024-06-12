import type { BunSai } from "../core";
import type { Attributes } from "../core/attrs";
import { buildClient, type ClientBuild } from "../core/build";
import type { Module, ModuleRenderResult } from "../core/module";
import { registry } from "../core/register";

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
   * Default: pull modules from registry
   */
  modules?: Module<any>[];
  programEntrypoint: string;
  build: {
    prefix: string;
    root: string;
  };
}

export class Builder implements BuilderArgs {
  modules: Module<any>[];
  programEntrypoint: string;
  clientBuild: ClientBuild | null = null;
  bunsai: BunSai | null = null;
  build: {
    prefix: string;
    root: string;
  };

  constructor(args: BuilderArgs) {
    this.programEntrypoint = args.programEntrypoint;

    this.build = args.build;

    this.modules = args.modules || Array.from(registry.values());

    if (this.modules.length == 0) throw new Error("empty BunSai registry");
  }

  async init() {
    const build = await buildClient(this.build.prefix, this.build.root);

    if (!build) throw new Error("build client failed");

    this.clientBuild = build;
  }

  warm() {
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
}

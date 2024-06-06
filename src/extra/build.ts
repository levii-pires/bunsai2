import type { Attributes } from "../core/attrs";
import type { Module, ModuleRenderResult } from "../core/module";
import { registry } from "../core/register";

export type WarmupResult = Map<
  Module<any>,
  {
    attrs: Attributes;
    render: ModuleRenderResult;
  }
>;

export interface BuilderArgs {
  /**
   * Default: pull modules from registry
   */
  modules?: Module<any>[];
  programEntrypoint: string;
}

export class Builder implements BuilderArgs {
  modules: Module<any>[];
  programEntrypoint: string;

  constructor(args: BuilderArgs) {
    this.programEntrypoint = args.programEntrypoint;

    this.modules = args.modules || Array.from(registry.values());

    if (this.modules.length == 0) throw new Error("empty BunSai registry");
  }

  warm() {
    const result: WarmupResult = new Map();

    for (const module of this.modules) {
      const attrs = {} as Attributes;

      result.set(module, {
        attrs,
        render: module.$m_render({
          isServer: true,
          attrs,
          context: {},
          step: "build",
        }),
      });
    }

    return result;
  }
}

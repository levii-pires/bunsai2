import type { Attributes } from "../core/attrs";
import type { Module, StandaloneModule } from "../core/module";
import { registry } from "../core/register";

export interface BuilderArgs {
  programEntrypoint: string;
}

export class Builder implements BuilderArgs {
  modules: Module<any>[];
  programEntrypoint: string;

  constructor(args: BuilderArgs) {
    this.programEntrypoint = args.programEntrypoint;

    if (registry.size == 0) throw new Error("empty BunSai registry");
    this.modules = Array.from(registry.values());
  }

  warm() {
    const result: Map<
      Module<any>,
      {
        attrs: Attributes;
        render: {
          head: string;
          html: string;
          css: string;
        };
      }
    > = new Map();

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

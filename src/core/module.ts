import type { Attributes } from "./attrs";
import type { ScriptData } from "./script";
import type { StandaloneRenderer } from "./register";

export interface ModuleProps {
  /**
   * Module scoped css
   */
  css: string | null;
  cssHash: string;
  path: string;
}

export interface ModuleComponent {}

export interface ModuleRenderProps<Context extends Record<string, any>> {
  /**
   * Static modules always have empty context.
   */
  context: Context;
  attrs: Attributes;
  /**
   * use {@link step}
   * @deprecated
   */
  isServer: boolean;
  /**
   * - `server`: at this step you can populate `attrs` and access the full `context` object + the Bun API;
   * - `client`: populating `attrs` does nothing, `context` is just a JSON and the Bun API does not exist;
   * - `build`: the builder is warming up the module. `context` is an empty object.
   * - `static`: the module is being evaluated as a static module.
   */
  step: "server" | "client" | "build" | "static";
}

export interface ModuleRenderResult {
  head: string;
  html: string;
  css: string;
}

export type ModuleRenderer<Context extends Record<string, any>> = (
  props: ModuleRenderProps<Context>
) => ModuleRenderResult;

export interface Module<
  Context extends Record<string, any> = Record<string, any>
> {
  $m_meta: ModuleProps;
  $m_symbol: typeof ModuleSymbol;
  $m_render: ModuleRenderer<Context>;
  /**
   * If true, this module will be treated as a static module
   */
  $m_static: boolean;

  /**
   * Client side hydration script tag generator
   */
  $m_gen_script(data: ScriptData): string;
}

export interface StandaloneModule<
  Context extends Record<string, any> = Record<string, any>
> extends Module<Context> {
  render: StandaloneRenderer<Context>;
}

export const ModuleSymbol = Symbol("bunsai.module");

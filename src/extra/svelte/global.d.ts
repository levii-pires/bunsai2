/// <reference path="../../core/global.d.ts"/>
/// <reference path="../../core/global.d.ts"/>
/// <reference path="../../core/global.d.ts"/>

declare type SvelteModule = import("../../core/module").StandaloneModule &
  import("svelte").SvelteComponent;

declare module "*.svelte" {
  const module: SvelteModule;

  export default module;
}

declare type Props<Context extends Record<string, any>> =
  import("../../core/module").ModuleRenderProps<Context>;

declare type SvelteConfig = import("./config").Config;

/**
 * Must **NOT** be used in `context="module"` script
 *
 * Converts Bun asset import into a BunSai compatible URL.
 *
 * NOTE: Unavailable if `SvelteConfig.bunsai2.useAsset` is set to `false`.
 *
 * @example
 * import logo from "./assets/logo.png";
 *
 * asset(logo); // /__bunsai__/assets/logo.png
 */
declare var asset: import("../asset").Asset;

import type { BunSai } from ".";
import type { BunPlugin } from "bun";
import { createHolder, type Holder } from "./util";
import { ModuleSymbol as $ms } from "./module";
import type { BaseLogger } from "pino";
import type { ClientBuild } from "./build";

// to avoid type errors
const $global: any = typeof global != "undefined" ? global : {};

export const CurrentBunSai: Holder<BunSai> =
  ($global.$$$bunsai_current_bunsai ||= createHolder());

export const CurrentClientBuild: Holder<ClientBuild> =
  ($global.$$$bunsai_current_client_build ||= createHolder());

export const IsDev: Holder<boolean> = ($global.$$$bunsai_is_dev ||=
  createHolder(typeof Bun != "undefined" && Bun.env.NODE_ENV != "production"));

export const Logger: Holder<BaseLogger> = ($global.$$$bunsai_logger ||=
  createHolder());

export const BrowserBuildPlugins: BunPlugin[] =
  ($global.$$$bunsai_browser_build_plugins ||= []);

export const ServerBuildPlugins: BunPlugin[] =
  ($global.$$$bunsai_server_build_plugins ||= []);

export const ModuleSymbol: typeof $ms = ($global.$$$bunsai_module_symbol ||=
  $ms);

Array.prototype.mapAsync = function mapAsync(callbackFn, thisArg) {
  return Promise.all(this.map(callbackFn, thisArg));
};

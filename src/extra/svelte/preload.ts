/// <reference path="./global.d.ts" />

import { IsDev } from "../../core/globals";
import { makePlugin } from "../../core/make-plugin";
import getSvelteConfig from "./config";
import { SvelteHydratable, SvelteResolvedConfig } from "./globals";
import createPlugins from "./plugins";

const svConfig = await getSvelteConfig();

if (svConfig.bunsai2.overrideIsDev)
  IsDev(svConfig.compilerOptions.dev ?? Bun.env.NODE_ENV != "production");

SvelteResolvedConfig(svConfig);
SvelteHydratable(svConfig.compilerOptions.hydratable ?? true);

makePlugin(createPlugins(svConfig));

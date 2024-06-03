/// <reference path="./global.d.ts"/>

import type { Attributes } from "./attrs";
import { buildClient } from "./build";
import { log } from "./util";
import { CurrentBunSai, CurrentClientBuild } from "./globals";
import { type Renderer } from "./create-renderer";
import { createResult } from "./create-result";
import { normalizeConfig } from "./normalize-config";

export interface BunSai {
  prefix: string;
  root: string;
  declarations: { path: string; handle: () => Response }[];
  render: Renderer;
}

export interface BunsaiConfig {
  /**
   * Root folder where all your files will be placed.
   *
   * This is used on `Bun.build` to ensure the correct path resolution.
   *
   * @default process.cwd()
   */
  root?: string;
  /**
   * Where the client build will be served.
   *
   * @default '/__bunsai__/'
   */
  prefix?: string;
  /**
   * To be applied on builds
   */
  defaults?: {
    attrs?: Attributes;
  };
}

export default async function bunsai(
  config: BunsaiConfig = {}
): Promise<BunSai> {
  const { prefix, defaults, root } = normalizeConfig(config);

  const build = await buildClient(prefix, root);

  if (!build) {
    log.loud("empty client endpoints. No module was registered");

    const retorno = {
      prefix,
      root: root,
      declarations: [],
      render() {
        return new Response("empty client endpoints", {
          status: 500,
          statusText: "empty client endpoints",
        });
      },
    };

    CurrentBunSai(retorno);

    return retorno;
  }

  CurrentClientBuild(build);

  const result = createResult(build, prefix, root, defaults.attrs);

  CurrentBunSai(result);

  const paths = build.extra
    .concat(Array.from(build.entries.values()))
    .map((i) => i.path);

  log.debug("client endpoints:", paths.length);
  log.verbose("endpoint: ", paths.join("\n\tendpoint: "));

  return result;
}

export type { Attributes as RenderAttributes };

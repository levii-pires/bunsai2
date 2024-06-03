import type { BunPlugin } from "bun";
import * as svelte from "svelte/compiler";
import type { ResolvedSvelteConfig } from "./config";
import { log } from "../../core/util";
import { IsDev } from "../../core/globals";
import { SvelteHydratable } from "./globals";

export default function createPlugins(svelteConfig: ResolvedSvelteConfig) {
  const {
    extensions,
    preprocess,
    compilerOptions,
    bunsai2: { useAsset, ignore },
  } = svelteConfig;

  const ignoreGlob = ignore.map((g) => new Bun.Glob(g));

  const ignoreGlobMatches = (path: string) =>
    ignoreGlob.some((g) => g.match(path));

  const rxExtensions = extensions
    .map((etx) => etx.replaceAll(".", "\\."))
    .join("|");

  const filter = new RegExp(`(${rxExtensions})$`);

  return {
    bun: {
      name: "Svelte Bun Plugin",
      target: "bun",
      setup(build) {
        build.onLoad({ filter }, async (args) => {
          const { code } = await svelte.preprocess(
            await Bun.file(args.path).text(),
            preprocess,
            { filename: args.path }
          );

          const name = "$" + Bun.hash(args.path, 0).toString(36);

          const {
            js: { code: js },
            warnings,
          } = svelte.compile(code, {
            ...compilerOptions,
            hydratable: SvelteHydratable(),
            dev: IsDev(),
            filename: args.path,
            generate: "ssr",
            css: "external",
            name,
          });

          warnings.forEach((w) =>
            log.verbose("[svelte]:", w.filename, w.message)
          );

          if (ignoreGlobMatches(args.path)) {
            log.verbose("[svelte]: ignoring", args.path);

            return {
              contents:
                (useAsset == false
                  ? ""
                  : 'import $create_asset_getter  from "bunsai/asset";\n' +
                    "const asset = $create_asset_getter(import.meta);\n") + js,
              loader: "js",
            };
          }

          return {
            contents:
              (useAsset == false
                ? ""
                : 'import $create_asset_getter  from "bunsai/asset";\n' +
                  "const asset = $create_asset_getter(import.meta);\n") +
              'import { register as $register } from "bunsai/register";\n' +
              'import { ModuleSymbol } from "bunsai/globals";\n' +
              'import { genScript as $sv_gen_script } from "bunsai/svelte/script.ts";\n' +
              'import { transformRender as $sv_transform_render } from "bunsai/svelte/transform-render.ts";\n' +
              js +
              `\nconst $m_meta={css:null,cssHash:"${name.slice(
                1
              )}",path:${JSON.stringify(args.path)},};` +
              "\nconst $m_symbol = ModuleSymbol;" +
              `\nconst $m_render=$sv_transform_render(${name}.render);` +
              "\nconst $m_gen_script = $sv_gen_script;" +
              "\nconst render = $register({$m_meta,$m_render,$m_symbol,$m_gen_script});" +
              `\nObject.assign(${name},{$m_meta,$m_render,$m_symbol,$m_gen_script,render})`,
            loader: "js",
          };
        });
      },
    },
    browser: {
      name: "Svelte Browser Plugin",
      target: "browser",
      setup(build) {
        build.onLoad({ filter }, async (args) => {
          const { code } = await svelte.preprocess(
            await Bun.file(args.path).text(),
            preprocess,
            { filename: args.path }
          );

          const name = "$" + Bun.hash(args.path, 0).toString(36);

          const {
            js: { code: js },
            warnings,
          } = svelte.compile(code, {
            ...compilerOptions,
            hydratable: SvelteHydratable(),
            dev: IsDev(),
            filename: args.path,
            css: "external",
            generate: "dom",
            name,
          });

          warnings.forEach((w) =>
            log.verbose("[svelte]:", w.filename, w.message)
          );

          return {
            contents:
              (useAsset == false
                ? ""
                : 'import $create_asset_getter  from "bunsai/asset";\n' +
                  "const asset = $create_asset_getter(import.meta);\n") + js,
            loader: "js",
          };
        });
      },
    },
  } satisfies { bun: BunPlugin; browser: BunPlugin };
}

import type { Attributes } from "./attrs";
import { type ClientBuild } from "./build";
import { render } from "./render";
import { processRenderAttrs } from "./attrs";
import { genCSS } from "./css";
import type { Module } from "./module";

export type Renderer = <Context extends Record<string, any>>(
  module: Module<Context>,
  context: Context
) => Response;

export function createRenderer(
  result: ClientBuild,
  prefix: string,
  defaultAttrs?: Attributes
): Renderer {
  return (module, context) => {
    const { $m_meta: meta, $m_render, $m_gen_script } = module;

    const attrs: Attributes = {};

    const { head, html, css } = $m_render({
      context,
      attrs,
      isServer: true,
      step: "server",
    });

    meta.css = css;

    const { path } = result.entries.get(meta.path)!;

    return render({
      ...processRenderAttrs(attrs, defaultAttrs),
      body_content: html,
      head_content: head + genCSS({ meta, prefix }),
      script_content: $m_gen_script({
        clientPath: path,
        props: {
          context,
          attrs,
          isServer: false,
          step: "client",
        },
      }),
    });
  };
}

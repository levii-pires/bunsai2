import type { Attributes } from "./attrs";
import { type ClientBuild } from "./build";
import { render } from "./render";
import { processRenderAttrs } from "./attrs";
import { genCSS } from "./css";
import type { Module, ModuleRenderResult } from "./module";

export type Renderer = <Context extends Record<string, any>>(
  module: Module<Context>,
  context: Context
) => Response;

export interface DynamicResponseArgs {
  module: Module<any>;
  result: ClientBuild;
  prefix: string;
  defaultAttrs?: Attributes;
}

export function createDynamicRenderer({
  module,
  prefix,
  result,
  defaultAttrs,
}: DynamicResponseArgs) {
  const { $m_meta: meta, $m_render, $m_gen_script } = module;

  return function dynamicRenderer(context: any) {
    const attrs: Attributes = {};

    const { head, html, css } = $m_render({
      context,
      attrs,
      isServer: true,
      step: "server",
    });

    const { path } = result.entries.get(meta.path)!;

    return render({
      ...processRenderAttrs(attrs, defaultAttrs),
      body_content: html,
      head_content: head + `<style>${css}</style>`,
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

export interface StaticResponseArgs {
  module: Module<any>;
  result: { render: ModuleRenderResult; build: ClientBuild };
  prefix: string;
  attrs: Attributes;
  defaultAttrs?: Attributes;
}

export function createStaticRenderer({
  attrs,
  module,
  prefix,
  result,
  defaultAttrs,
}: StaticResponseArgs) {
  const { $m_meta: meta, $m_gen_script } = module;

  const {
    render: { head, html, css },
    build,
  } = result;

  if (css) meta.css = css;

  const { path } = build.entries.get(meta.path)!;

  const renderAttrs = processRenderAttrs(attrs, defaultAttrs),
    head_content = head + genCSS({ meta, prefix }),
    script_content = $m_gen_script({
      clientPath: path,
      props: {
        context: {},
        attrs,
        isServer: false,
        step: "client",
      },
    }),
    data = {
      ...renderAttrs,
      body_content: html,
      head_content,
      script_content,
    };

  return function staticRenderer() {
    return render(data);
  };
}

export function createAutoRenderer(
  result: ClientBuild,
  prefix: string,
  defaultAttrs?: Attributes
): Renderer {
  const rendererRecord: Record<string, (context?: any) => Response> = {};

  return (module, context) => {
    if (!rendererRecord[module.$m_meta.path]) {
      if (module.$m_static) {
        const attrs: Attributes = {};
        rendererRecord[module.$m_meta.path] = createStaticRenderer({
          attrs,
          module,
          prefix,
          defaultAttrs,
          result: {
            build: result,
            render: module.$m_render({
              attrs,
              context: {} as any,
              step: "static",
              isServer: true,
            }),
          },
        });
      } else {
        rendererRecord[module.$m_meta.path] = createDynamicRenderer({
          module,
          prefix,
          result,
          defaultAttrs,
        });
      }
    }

    console.log(rendererRecord);

    return rendererRecord[module.$m_meta.path]!(context);
  };
}

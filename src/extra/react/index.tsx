import React, { type ReactNode } from "react";
import type { ModuleRenderProps, StandaloneModule } from "../../core/module";
import { hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { genScript } from "./script";
import { ModuleSymbol } from "../../core/globals";
import { register } from "../../core/register";

export interface ReactModuleDeclaration<Context extends Record<string, any>> {
  component: (props: ModuleRenderProps<Context>) => ReactNode;
  head?: (props: ModuleRenderProps<Context>) => ReactNode;
  css?: (props: ModuleRenderProps<Context>) => string;
  importMeta: ImportMeta;
  isStatic?: boolean;
}

export interface ReactModule<Context extends Record<string, any>> {
  (props: ModuleRenderProps<Context>): ReactNode;
  head?: (props: ModuleRenderProps<Context>) => ReactNode;
  css?: (props: ModuleRenderProps<Context>) => string;
  importMeta: ImportMeta;
  $hydrate(props: ModuleRenderProps<Context>): void;
  isStatic?: boolean;
}

export type ReactProps<Context extends Record<string, any> = {}> =
  ModuleRenderProps<Context>;

export function make<Context extends Record<string, any>>(
  decl: ReactModuleDeclaration<Context>
): ReactModule<Context> {
  const Module = decl.component;
  return Object.assign(Module, {
    importMeta: decl.importMeta,
    head: decl.head,
    css: decl.css,
    isStatic: decl.isStatic,
    $hydrate(props: ModuleRenderProps<Context>) {
      hydrateRoot((window as any).$root, <Module {...props} />);
    },
  });
}

/**
 * Transform a {@link ReactModule} (previously built using {@link make}) into a BunSai Module.
 */
export function react<Context extends Record<string, any>>(
  Module: ReactModule<Context>
): StandaloneModule<Context> {
  const path = Bun.fileURLToPath(Module.importMeta.url);
  const $m_symbol: typeof ModuleSymbol = ModuleSymbol,
    $m_meta = {
      css: null,
      cssHash: Bun.hash(path, 1).toString(36),
      path,
    },
    $m_static = Module.isStatic || false,
    $m_gen_script = genScript,
    $m_render = (props: ModuleRenderProps<Context>) => {
      return {
        head: renderToStaticMarkup(Module.head && <Module.head {...props} />),
        css: (Module.css && Module.css(props)) || "",
        html: renderToString(<Module {...props} />),
      };
    };

  return {
    $m_gen_script,
    $m_meta,
    $m_render,
    $m_symbol,
    $m_static,
    render: register<Context>({
      $m_symbol,
      $m_meta,
      $m_gen_script,
      $m_render,
      $m_static,
    }),
  };
}

/**
 * Construct a table of BunSai Modules.
 *
 * @example
 * import TestReact from "../react/test.tsx";
 * import { table } from "bunsai/react";
 *
 * TestReact // -> ReactModule
 * const t = table({ TestReact });
 * t.TestReact // -> StandaloneModule
 *
 *
 */
export function table<Data extends Record<string, ReactModule<any>>>(
  data: Data
): ModuleTable<Data> {
  const retorno = {} as any;

  for (const [key, value] of Object.entries(data)) {
    retorno[key] = react(value);
  }

  return retorno;
}

export type ModuleTable<Data extends Record<string, ReactModule<any>>> = {
  [K in keyof Data]: Data[K] extends ReactModule<infer T>
    ? StandaloneModule<T>
    : never;
};

export { React };

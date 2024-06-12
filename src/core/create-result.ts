import type { Attributes } from "./attrs";
import { type ClientBuild } from "./build";
import { createAutoRenderer } from "./create-renderer";
import type { BunSai } from ".";

export function createResult(
  build: ClientBuild,
  prefix: string,
  root: string,
  defaultAttrs?: Attributes
) {
  const manifest = build.extra.concat(Array.from(build.entries.values()));

  const retorno: BunSai = {
    prefix,
    root,
    render: createAutoRenderer(build, prefix, defaultAttrs),
    declarations: [],
  };

  for (const { object, path } of manifest) {
    retorno.declarations.push({
      path,
      handle: () => {
        const obj = object();
        return new Response(obj, { headers: { "content-type": obj.type } });
      },
    });
  }

  return retorno;
}

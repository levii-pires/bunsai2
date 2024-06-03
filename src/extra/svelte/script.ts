import type { ScriptData } from "../../core/script";
import { SvelteHydratable } from "./globals";

export function genScript(data: ScriptData) {
  return (
    '<script type="module">' +
    `import Component from "${data.clientPath}";` +
    `window.$sv_instance = new Component({hydrate:${SvelteHydratable()},target:window.$root,props:${JSON.stringify(
      { props: data.props }
    )}})` +
    "</script>"
  );
}

type Reserved<K extends string | number | symbol> = {
  /**
   * **RESERVED ATTRIBUTE**
   */
  [P in K]?: never;
};

export interface Attributes {
  /**
   * Set (or override `defaults`) `body` attributes.
   */
  body_attrs?: Record<string, string>;
  /**
   * Set (or override `defaults`) root element attributes.
   *
   * **NOTE:** `id` is a reserved attribute.
   */
  root_attrs?: Record<string, string> & Reserved<"id">;
  /**
   * Set (or override `defaults`) html lang.
   */
  html_lang?: string;
}

export type ProcessedRenderAttrs = Record<keyof Attributes, string>;

function objToAttrs(obj: object) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
}

export function processRenderAttrs(
  attrs: Attributes,
  defaults: Attributes = {}
): ProcessedRenderAttrs {
  if (attrs.root_attrs) delete attrs.root_attrs.id;
  if (defaults.root_attrs) delete defaults.root_attrs.id;

  return mergeAttrs(attrs, defaults);
}

export function mergeAttrs(attrs: Attributes, defaults: Attributes) {
  return {
    body_attrs: objToAttrs({ ...defaults.body_attrs, ...attrs.body_attrs }),
    html_lang: attrs.html_lang || defaults.html_lang || "",
    root_attrs: objToAttrs({ ...defaults.root_attrs, ...attrs.root_attrs }),
  };
}

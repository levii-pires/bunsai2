export function transformRender(
  svelteRenderer: (props: any) => {
    html: string;
    head: string | null;
    css: { code: string | null };
  }
) {
  return (props: any) => {
    const tProps = Object.create(
      null,
      Object.keys(props)
        .map((k) => ({
          [k]: {
            enumerable: false,
            get() {
              console.warn(`'${k}' is deprecated. Use 'props.${k}'.`);
              return props[k];
            },
          } as PropertyDescriptor,
        }))
        .reduce((prev, curr) => ({ ...prev, ...curr }), {
          props: { enumerable: true, value: props } as PropertyDescriptor,
        })
    );

    const {
      css: { code },
      head,
      html,
    } = svelteRenderer(tProps);

    return {
      html,
      head: head || "",
      css: code || "",
    };
  };
}

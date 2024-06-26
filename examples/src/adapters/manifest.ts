import { plugged } from "bunsai/manifest";
import SvelteTest from "../svelte/test.svelte";
import ReactTest from "../react/test";
import { table } from "bunsai/react";

const t = table({ ReactTest });

const { assets, render } = await plugged();

Bun.serve({
  fetch(req) {
    const url = new URL(req.url);

    const matched = assets.get(url.pathname);

    if (matched) return matched();

    switch (url.pathname) {
      case "/":
        // using manifest render function
        return render(SvelteTest, { req });
      case "/test":
        // using component standalone render function
        return SvelteTest.render({ req });
      case "/react":
        return t.ReactTest.render({ req });
      default:
        return new Response("NOT FOUND", { status: 404 });
    }
  },
});

console.log("Serving");

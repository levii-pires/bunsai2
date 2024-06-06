import { plugged } from "bunsai/manifest";
import * as modules from "../modules";

const { assets, render } = await plugged();

Bun.serve({
  fetch(req) {
    const url = new URL(req.url);

    const matched = assets.get(url.pathname);

    if (matched) return matched();

    switch (url.pathname) {
      case "/":
        // using manifest render function
        return render(modules.SvelteTest, { req });
      case "/test":
        // using component standalone render function
        return modules.SvelteTest.render({ req });
      case "/react":
        return modules.ReactTest.render({ req });
      default:
        return new Response("NOT FOUND", { status: 404 });
    }
  },
});

console.log("Serving");

import { plugged } from "bunsai/hono";
import * as modules from "../modules";

const { handler, hono } = await plugged();

const { fetch } = hono()
  // using 'plugged' handler function
  .get("/", handler(modules.SvelteTest))
  // using component standalone render function
  .get("/test", modules.SvelteTest.render)
  .get("/react", modules.ReactTest.render);

Bun.serve({
  fetch,
});

console.log("Hono Ready!");

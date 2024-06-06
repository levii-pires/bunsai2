import { plugged } from "bunsai/elysia";
import * as modules from "../modules";

const { elysia, handler } = await plugged();

elysia()
  // using 'plugged' handler function
  .get("/", handler(modules.SvelteTest))
  // using decorator
  .get("/decor", ({ render, ...context }) =>
    render(modules.SvelteTest, context)
  )
  // using component standalone render function
  .get("/react", modules.ReactTest.render)
  .listen(3000);

console.log("Elysia Ready!");

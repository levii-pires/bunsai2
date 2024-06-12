import { plugged } from "bunsai/byte";
import * as modules from "../modules";

const { handler, byte } = await plugged();

const bit = byte()
  .get("/*", () => new Response("NOT_FOUND", { status: 404 }))
  // using 'plugged' handler function
  .get("/", handler(modules.SvelteTest))
  // using component standalone render function
  .get("/test", modules.SvelteTest.render)
  .get("/react", modules.ReactTest.render);

Bun.serve(bit);

console.log("Byte Ready!");

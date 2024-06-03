import { plugged } from "bunsai/byte";
import SvelteTest from "../svelte/test.svelte";
import ReactTest from "../react/test";
import { table } from "bunsai/react";

const t = table({ ReactTest });

const { handler, byte } = await plugged();

const bit = byte()
  // using 'plugged' handler function
  .get("/", handler(SvelteTest))
  // using component standalone render function
  .get("/test", SvelteTest.render)
  .get("/react", t.ReactTest.render);

Bun.serve(bit);

console.log("Byte Ready!");

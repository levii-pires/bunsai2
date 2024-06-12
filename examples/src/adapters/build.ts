import "../modules";
import "bunsai/with-config";
import { Builder } from "bunsai/build";

const build = new Builder({
  programEntrypoint: Bun.fileURLToPath(import.meta.resolve("./byte.ts")),
});

console.log(build.warmModules());

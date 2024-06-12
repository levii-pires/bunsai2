import "../modules";
import { Builder } from "bunsai/build";

await Builder.build({
  config: {},
  outFolder: "./dist",
  programEntrypoint: "",
});

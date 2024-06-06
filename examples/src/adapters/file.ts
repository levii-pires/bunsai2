import "../modules";
import "bunsai/with-config";
import { writeToDisk } from "bunsai/file";

await writeToDisk("./dist");

console.log("wrote files to './dist'");

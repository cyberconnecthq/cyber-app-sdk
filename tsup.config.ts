import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  target: "esnext",
  format: "esm",
  tsconfig: "tsconfig.json",
});

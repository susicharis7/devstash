import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));
const nextServer = fileURLToPath(
  new URL("./node_modules/next/server.js", import.meta.url)
);

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\/(.*)$/, replacement: `${src}/$1` },
      { find: /^next\/server$/, replacement: nextServer },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
    passWithNoTests: true,
    server: {
      deps: {
        inline: ["next-auth", "@auth/core"],
      },
    },
  },
});

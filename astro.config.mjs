// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@/*": path.resolve("./src/*"),
      },
    },
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
  },
  image: {
    service: {
      entrypoint: "astro/assets/services/noop",
    },
  },
});

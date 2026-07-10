import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const dev = process.argv.includes("dev");

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      assets: "build",
      fallback: "404.html",
      pages: "build",
      precompress: false,
      strict: true,
    }),
    paths: {
      base: dev ? "" : process.env.BASE_PATH || "",
    },
  },
  preprocess: vitePreprocess(),
};

export default config;

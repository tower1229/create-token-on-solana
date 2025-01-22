import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { TanStackRouterRspack } from "@tanstack/router-plugin/rspack";
import { pluginTailwindCSS } from "rsbuild-plugin-tailwindcss";
import { pluginNodePolyfill } from "@rsbuild/plugin-node-polyfill";
import { pluginSvgr } from "@rsbuild/plugin-svgr";

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginTailwindCSS(),
    pluginNodePolyfill(),
    pluginSvgr(),
  ],
  tools: {
    rspack: {
      plugins: [TanStackRouterRspack()],
    },
  },
  source: {
    alias: {
      "@": "./src",
    },
  },
  html: {
    title: "Create Token On Solana",
    favicon: "./public/images/favicon.ico",
  },
});

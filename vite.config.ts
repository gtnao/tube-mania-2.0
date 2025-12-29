import { crx, defineManifest } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const manifest = defineManifest({
  manifest_version: 3,
  name: "Tube Mania 2.0",
  version: "2.0.0",
  description: "Video audio controller with pitch shift, EQ, loop, and piano features",
  permissions: ["tabs"],
  action: {
    default_popup: "index.html",
    default_icon: {
      "16": "public/icons/icon-16.png",
      "128": "public/icons/icon-128.png",
    },
  },
  icons: {
    "16": "public/icons/icon-16.png",
    "128": "public/icons/icon-128.png",
  },
  content_scripts: [
    {
      matches: ["https://www.youtube.com/*", "https://www.instagram.com/*"],
      js: ["src/content/main.ts"],
    },
  ],
});

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
});

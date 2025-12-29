import { crx, defineManifest } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const manifest = defineManifest({
  manifest_version: 3,
  // TODO: please change this to your extension's Name
  name: "Example Extension",
  version: "1.0.0",
  permissions: ["tabs"],
  action: {
    default_popup: "index.html",
  },
  content_scripts: [
    {
      matches: ["https://*/*"],
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

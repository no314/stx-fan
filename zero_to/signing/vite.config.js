import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static build (architecture ladder rung 1). No backend, no runtime CDN:
// every dependency — React, @stacks/connect + @stacks/transactions (vendored
// known-good bundles in src/vendor/), Phosphor icons, fonts — is pinned and
// bundled into dist/ at build time.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 4000
  }
});

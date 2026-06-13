import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  optimizeDeps: {
    noDiscovery: true,
    include: []
  },
  server: {
    fs: {
      strict: true,
      allow: ["."]
    }
  }
});

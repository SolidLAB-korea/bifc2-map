import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  optimizeDeps: {
    noDiscovery: true,
    include: ["react", "react/jsx-runtime", "react/jsx-dev-runtime", "react-dom", "react-dom/client", "react-router", "react-router-dom"]
  },
  server: {
    fs: {
      strict: true,
      allow: ["."]
    }
  }
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      // Client build only: in the SSR build React is external and Rollup
      // would refuse to place the module in a manual chunk.
      output: isSsrBuild
        ? {}
        : {
            // Stable vendor chunks: better browser cache across deploys and avoids
            // a single ~690 KB file.
            manualChunks: {
              react: ["react", "react-dom", "react/jsx-runtime", "react-router-dom"],
              motion: ["framer-motion"],
            },
          },
    },
  },
  preview: {
    port: 8080,
  },
}));

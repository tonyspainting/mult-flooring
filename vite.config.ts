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
      // Só no build do cliente: no build SSR o React é externo e o Rollup
      // recusaria incluir o módulo em um chunk manual.
      output: isSsrBuild
        ? {}
        : {
            // Vendor em chunks estáveis: melhora o cache entre deploys e evita
            // um único arquivo de ~690 KB.
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

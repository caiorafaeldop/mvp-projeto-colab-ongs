import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "https://mvp-colab-ongs-backend.onrender.com",
        changeOrigin: true,
      },
    },
    allowedHosts: ["localhost", ".pythagora.ai", "all"],
    watch: {
      ignored: [
        "**/node_modules/**",
        "**/dist/**",
        "**/public/**",
        "**/log/**",
      ],
    },
  },
});

import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import removeConsole from "vite-plugin-remove-console";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), removeConsole()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base = nome do repositorio, porque o GitHub Pages publica em /garimpo/
export default defineConfig({
  plugins: [react()],
  base: "/garimpo/",
});

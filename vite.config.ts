import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // The repository is published at https://<user>.github.io/fintrack/
  base: "/fintrack/",
  plugins: [react()],
});
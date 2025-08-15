import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@crafely/tiptap-vue": path.resolve(
        __dirname,
        "../../packages/tiptap-vue/src"
      ),
    },
  },
  server: { port: 5174 },
});

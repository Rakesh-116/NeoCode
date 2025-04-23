import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://neocode-api.rakeshp.me",
        // target: "http://localhost:8080",
        changeOrigin: true,
        secure: false, // If using self-signed SSL, set to `false`
      },
    },
  },
});

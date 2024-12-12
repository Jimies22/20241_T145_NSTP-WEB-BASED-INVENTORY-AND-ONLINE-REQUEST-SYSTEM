// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Set the port you want, e.g., 3001
    headers: {
      "Cross-Origin-Embedder-Policy": "credentialless",
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Content-Security-Policy": `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://www.gstatic.com;
        style-src 'self' 'unsafe-inline' https://unpkg.com;
        frame-src https://accounts.google.com;
        connect-src 'self' https://accounts.google.com https://www.googleapis.com;
      `
        .replace(/\s+/g, " ")
        .trim(),
    },
  },
});

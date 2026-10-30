/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    env: {
      VITE_API_BASE_URL: "http://localhost:5048",
      VITE_OIDC_AUTHORITY: "http://localhost:8080/realms/finance",
      VITE_OIDC_CLIENT_ID: "finance-web",
    },
  },
});
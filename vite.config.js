import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const adminSlug = env.VITE_ADMIN_ROUTE_SLUG || "founder-console";
  if (!/^[a-z0-9-]{8,80}$/.test(adminSlug)) {
    throw new Error(
      "VITE_ADMIN_ROUTE_SLUG must contain 8–80 lowercase letters, numbers or hyphens",
    );
  }
  return {
    plugins: [
      react(),
      {
        name: "unlocktr-cloudflare-routes",
        generateBundle() {
          // Exact rewrites preserve SPA URLs without matching / or real assets.
          this.emitFile({
            type: "asset",
            fileName: "_redirects",
            source: `/verify /index.html 200\n/${adminSlug} /index.html 200\n`,
          });
        },
      },
    ],
  };
});

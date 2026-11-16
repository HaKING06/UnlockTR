import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
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
        writeBundle(options) {
          // Real HTML entries avoid Cloudflare's /index.html canonical redirect.
          const directory = options.dir || "dist";
          const shell = readFileSync(resolve(directory, "index.html"), "utf8");
          for (const route of ["verify", adminSlug]) {
            writeFileSync(resolve(directory, route + ".html"), shell);
          }
        },
      },
    ],
  };
});

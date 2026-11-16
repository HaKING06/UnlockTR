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
          for (const route of [
            "verify",
            "login",
            "register",
            "forgot-password",
            "account",
            "game",
            "vip",
            "manage",
            adminSlug,
          ]) {
            const titles = {
              login: "Giriş yap",
              register: "Hesap oluştur",
              verify: "E-posta doğrulama",
              account: "Hesap ayarları",
              game: "Oyun detayları",
              vip: "VIP üyelik",
              manage: "Yönetim merkezi",
              "forgot-password": "Şifremi unuttum",
            };
            const title = (titles[route] || "Yönetim merkezi") + " · UnlockTR";
            const noindex = !["login", "register", "vip"].includes(route);
            const page = shell
              .replace(/<title>.*?<\/title>/s, "<title>" + title + "</title>")
              .replace(
                "</head>",
                (noindex
                  ? '<meta name="robots" content="noindex,nofollow"/>'
                  : '<link rel="canonical" href="https://unlocktr.haking.tr/' +
                    route +
                    '"/>') + "</head>",
              );
            writeFileSync(resolve(directory, route + ".html"), page);
          }
        },
      },
    ],
  };
});

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
        name: "utrzone-cloudflare-routes",
        writeBundle(options) {
          // Real HTML entries avoid Cloudflare's /index.html canonical redirect.
          const directory = options.dir || "dist";
          const apiOrigin = (
            env.VITE_API_URL || "https://unlocktr-backend.onrender.com/api"
          ).replace(/\/$/, "");
          writeFileSync(
            resolve(directory, "warmup.js"),
            readFileSync(resolve("public/warmup.js"), "utf8").replace(
              JSON.stringify(
                "https://unlocktr-backend.onrender.com/api/health",
              ),
              JSON.stringify(apiOrigin + "/health"),
            ),
          );
          const shell = readFileSync(
            resolve(directory, "index.html"),
            "utf8",
          ).replace(/<link[^>]+rel="canonical"[^>]+>/g, "");
          for (const route of [
            "verify",
            "login",
            "register",
            "forgot-password",
            "account",
            "game",
            "vip",
            "manage",
            "requests",
            "support",
            "privacy",
            "mail",
            "wallet",
            "favorites",
            "reports",
            "manage-coins",
            adminSlug,
          ]) {
            const titles = {
              favorites: "Favorilerim",
              reports: "Proje raporları",
              wallet: "UCoin cüzdanı",
              "manage-coins": "Coin yönetimi",
              mail: "Kurumsal e-posta",
              requests: "Oyun istekleri",
              support: "Destek ol",
              privacy: "Çerez ve hesap verileri",
              login: "Giriş yap",
              register: "Hesap oluştur",
              verify: "E-posta doğrulama",
              account: "Hesap ayarları",
              game: "Oyun detayları",
              vip: "VIP üyelik",
              manage: "Yönetim merkezi",
              "forgot-password": "Şifremi unuttum",
            };
            const title = (titles[route] || "Yönetim merkezi") + " · UTRZONE";
            const noindex = !["login", "register", "vip"].includes(route);
            const routeShell = ["login", "register"].includes(route)
              ? shell
              : shell.replace(/<link[^>]+rel="preload"[^>]+>/g, "");
            const page = routeShell
              .replace(/<title>.*?<\/title>/s, "<title>" + title + "</title>")
              .replace(
                "</head>",
                (noindex
                  ? '<meta name="robots" content="noindex,nofollow"/>'
                  : '<link rel="canonical" href="https://utrzone.haking.tr/' +
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

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
            env.VITE_API_URL || "https://unlocktr-backend.vercel.app/api"
          ).replace(/\/$/, "");
          writeFileSync(
            resolve(directory, "warmup.js"),
            readFileSync(resolve("public/warmup.js"), "utf8").replace(
              JSON.stringify("https://unlocktr-backend.vercel.app/api/ping"),
              JSON.stringify(apiOrigin + "/ping"),
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
            "about",
            "advertise",
            "help",
            "terms",
            "content-policy",
            "privacy",
            "mail",
            "wallet",
            "favorites",
            "reports",
            "manage-coins",
            adminSlug,
          ]) {
            const titles = {
              about: "Hakkımızda",
              advertise: "Reklam ve iş birliği",
              help: "Yardım merkezi",
              terms: "Kullanım koşulları",
              "content-policy": "İçerik ve telif",
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
            const descriptions = {
              about:
                "UTRZONE nedir? Underground Translation & Reworks kimliğimizi, kurucumuzu ve Türkçe yama platformumuzun amacını tanı.",
              advertise:
                "UTRZONE reklam ve iş birliği seçenekleri. Banner, sponsorlu tanıtım ve satış ortaklığı teklifleri için bizimle iletişime geçin.",
              help: "UTRZONE yardım merkezi: yama kurulumu, desteklenen sürümler, VIP, UCoin ve hesap soruları.",
              terms:
                "UTRZONE platform kullanım ilkeleri; hesap, içerik ve erişim koşulları.",
              "content-policy":
                "UTRZONE içerik standartları ve hak sahibi bildirimleri için iletişim yolu.",
              login:
                "UTRZONE hesabına giriş yap; favorilerini, VIP üyeliğini ve oyun isteklerini yönet.",
              register:
                "UTRZONE topluluğuna katıl. Türkçe oyun yamalarını keşfet, favorilerini kaydet ve oyun isteği oluştur.",
              vip: "UTRZONE VIP ayrıcalıklarını, reklamsız indirme ve günlük UCoin avantajlarını keşfet.",
              support:
                "UTRZONE ile iletişime geç, önerilerini paylaş ve Türkçe yama çalışmalarını destekle.",
            };
            const noindex = !Object.hasOwn(descriptions, route);
            const routeShell = ["login", "register"].includes(route)
              ? shell
              : shell.replace(/<link[^>]+rel="preload"[^>]+>/g, "");
            const page = routeShell
              .replace(/<title>.*?<\/title>/s, "<title>" + title + "</title>")
              .replace(
                /<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/g,
                `<meta name="description" content="${descriptions[route] || "UTRZONE hesap ve yönetim alanı."}" />`,
              )
              .replace(
                "</head>",
                (noindex
                  ? '<meta name="robots" content="noindex,nofollow"/>'
                  : '<link rel="canonical" href="https://utrzone.haking.tr/' +
                    route +
                    '"/>') + "</head>",
              );
            writeFileSync(resolve(directory, route + ".html"), page);
            const headerPath = resolve(directory, "_headers");
            writeFileSync(
              headerPath,
              readFileSync(headerPath, "utf8") +
                `\n/${route}\n  Cache-Control: no-store\n`,
            );
          }
        },
      },
    ],
  };
});

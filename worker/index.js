import {
  gamePath,
  gameTitle,
  gameDescription,
  gameSchema,
  SITE_ORIGIN,
} from "../src/game-url.js";
export const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const safeJson = (value) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
function errorPage(status) {
  const message =
    status === 404 ? "Oyun bulunamadı" : "Sayfa geçici olarak yüklenemedi";
  return new Response(
    `<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>${message} | UTRZONE</title><h1>${message}</h1><p><a href="/">Kütüphaneye dön</a></p></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Content-Type-Options": "nosniff",
        ...(status === 503 ? { "Retry-After": "30" } : {}),
      },
    },
  );
}
async function api(env, path) {
  // No visitor cookies or authorization are sent to the public, shared catalog.
  return fetch(
    (env.PUBLIC_API_URL || "https://unlocktr-backend.vercel.app/api") + path,
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    },
  );
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!["GET", "HEAD"].includes(request.method))
      return new Response(null, {
        status: 405,
        headers: { Allow: "GET, HEAD", "Cache-Control": "no-store" },
      });
    const sitemap =
      url.pathname === "/sitemap.xml" || url.pathname.startsWith("/sitemaps/");
    try {
      if (sitemap) {
        const r = await api(env, "/seo" + url.pathname);
        if (!r.ok) return errorPage(r.status === 404 ? 404 : 503);
        return new Response(request.method === "HEAD" ? null : r.body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=300",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
      const legacy = ["/game", "/game.html"].includes(url.pathname);
      if (!legacy && !url.pathname.startsWith("/oyun/"))
        return env.ASSETS.fetch(request);
      const value = legacy
        ? url.searchParams.get("id")
        : url.pathname.slice(6).replace(/\/$/, "").toLowerCase();
      if (
        !value ||
        (legacy
          ? !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)
          : !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
      )
        return errorPage(404);
      const r = await api(
        env,
        legacy ? "/games/" + value : "/games/by-slug/" + value,
      );
      if (!r.ok) return errorPage(r.status === 404 ? 404 : 503);
      const game = await r.json();
      const path = gamePath(game),
        canonical = SITE_ORIGIN + path;
      if (legacy || url.pathname !== path)
        return new Response(null, {
          status: 301,
          headers: {
            Location: canonical,
            "Cache-Control": "no-store, no-transform",
          },
        });
      const shell = await env.ASSETS.fetch(
        new Request(new URL("/game", url), { method: "GET" }),
      );
      if (!shell.ok) return errorPage(503);
      const headers = new Headers(shell.headers);
      headers.delete("ETag");
      headers.delete("Content-Length");
      headers.set("Cache-Control", "no-store, no-transform");
      const nonce = crypto.randomUUID().replaceAll("-", "");
      const policy =
        headers.get("Content-Security-Policy") ||
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'";
      headers.set(
        "Content-Security-Policy",
        policy.replace(
          "script-src 'self'",
          `script-src 'self' 'nonce-${nonce}'`,
        ),
      );
      headers.set("Content-Type", "text/html; charset=utf-8");
      if (request.method === "HEAD") return new Response(null, { headers });
      const h = escapeHtml,
        title = gameTitle(game),
        desc = gameDescription(game);
      const image = game.is_adult
        ? SITE_ORIGIN + "/brand/social-card.png"
        : game.cover_image_url;
      const extra = `<link rel="canonical" href="${h(canonical)}"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="rating" content="${game.is_adult ? "adult" : "general"}"><meta property="og:url" content="${h(canonical)}"><script id="utrzone-game-schema" nonce="${nonce}" type="application/ld+json">${safeJson(gameSchema(game))}</script><script id="utrzone-game-data" nonce="${nonce}" type="application/json">${safeJson(game)}</script>`;
      const body = `<main class="seo-game"><nav aria-label="İçerik yolu"><a href="/">Kütüphane</a> / ${h(game.title)}</nav><h1>${h(title.replace(" | UTRZONE", ""))}</h1><p>${h(game.engine)} · Sürüm ${h(game.version)}</p><p>${h(game.description)}</p>${game.is_adult ? "<p>18+ yetişkin içerik. Görseller varsayılan olarak gizlenir.</p>" : ""}${game.installation_notes ? "<h2>Kurulum</h2><p>" + h(game.installation_notes) + "</p>" : ""}<a href="/help">Kurulum ve indirme yardımı</a></main>`;
      return new HTMLRewriter()
        .on('link[rel="canonical"], meta[name="robots"]', {
          element: (e) => e.remove(),
        })
        .on("title", { element: (e) => e.setInnerContent(title) })
        .on('meta[name="description"], meta[property="og:description"]', {
          element: (e) => e.setAttribute("content", desc),
        })
        .on('meta[property="og:title"]', {
          element: (e) => e.setAttribute("content", title),
        })
        .on('meta[property="og:image"]', {
          element: (e) => e.setAttribute("content", image),
        })
        .on("head", { element: (e) => e.append(extra, { html: true }) })
        .on("#root", {
          element: (e) => e.setInnerContent(body, { html: true }),
        })
        .transform(new Response(shell.body, { headers }));
    } catch {
      return errorPage(503);
    }
  },
};

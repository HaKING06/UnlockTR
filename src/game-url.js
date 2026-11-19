export const SITE_ORIGIN = "https://utrzone.haking.tr";
export function gamePath(game) {
  return game.slug
    ? "/oyun/" + game.slug
    : "/game?id=" + encodeURIComponent(game.id);
}
export function gameTitle(game) {
  return (
    game.title +
    (game.has_tr_patch ? " TR Yama" : "") +
    (game.has_mod ? " ve Mod" : "") +
    " | UTRZONE"
  );
}
export function gameDescription(game) {
  return (
    game.title +
    (game.has_tr_patch ? " Türkçe yama" : "") +
    (game.has_mod ? " ve mod" : "") +
    ". " +
    game.description.replace(/\s+/g, " ")
  ).slice(0, 170);
}
export function gameSchema(game) {
  const url = SITE_ORIGIN + gamePath(game);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: gameTitle(game),
        description: gameDescription(game),
        inLanguage: "tr",
        dateModified: game.updated_at,
        isFamilyFriendly: !game.is_adult,
        mainEntity: { "@type": "VideoGame", name: game.title },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Kütüphane",
            item: SITE_ORIGIN + "/",
          },
          { "@type": "ListItem", position: 2, name: game.title, item: url },
        ],
      },
    ],
  };
}
export function initialGame() {
  try {
    const g = JSON.parse(
      document.getElementById("utrzone-game-data")?.textContent || "null",
    );
    return g && location.pathname.replace(/\/$/, "") === gamePath(g) ? g : null;
  } catch {
    return null;
  }
}
export function updateGameSeo(game) {
  document.title = gameTitle(game);
  const set = (selector, tag, attrs) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement(tag);
      document.head.append(el);
    }
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  };
  set('link[rel="canonical"]', "link", {
    rel: "canonical",
    href: SITE_ORIGIN + gamePath(game),
  });
  const desc = gameDescription(game);
  for (const [name, content] of [
    ["description", desc],
    ["robots", "index,follow,max-image-preview:large"],
    ["rating", game.is_adult ? "adult" : "general"],
  ])
    set(`meta[name="${name}"]`, "meta", { name, content });
  for (const [property, content] of [
    ["og:title", gameTitle(game)],
    ["og:description", desc],
    ["og:url", SITE_ORIGIN + gamePath(game)],
    [
      "og:image",
      game.is_adult
        ? SITE_ORIGIN + "/brand/social-card.png"
        : game.cover_image_url,
    ],
  ])
    set(`meta[property="${property}"]`, "meta", { property, content });
  let schema = document.getElementById("utrzone-game-schema");
  if (schema) schema.textContent = JSON.stringify(gameSchema(game));
}

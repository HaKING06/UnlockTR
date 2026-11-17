import { useEffect, useState } from "react";

export function navigate(path, replace = false) {
  const url = new URL(path, location.href);
  if (url.origin !== location.origin) return location.assign(url.href);
  if (document.querySelector('.game-editor[data-unsaved="true"]'))
    return location.assign(url.href);
  history[replace ? "replaceState" : "pushState"]({}, "", url.href);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function useClientNavigation(adminSlug) {
  const [route, setRoute] = useState(() => location.pathname + location.search);
  useEffect(() => {
    const routes = new Set([
      "/",
      "/game",
      "/login",
      "/register",
      "/verify",
      "/forgot-password",
      "/account",
      "/vip",
      "/support",
      "/about",
      "/advertise",
      "/help",
      "/terms",
      "/content-policy",
      "/privacy",
      "/requests",
      "/mail",
      "/wallet",
      "/favorites",
      "/reports",
      "/manage-coins",
    ]);
    const update = () => setRoute(location.pathname + location.search);
    const click = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = event.target.closest?.("a[href]");
      if (
        !link ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      )
        return;
      const url = new URL(link.href, location.href);
      if (
        url.origin !== location.origin ||
        !routes.has(url.pathname.replace(/\/$/, "") || "/")
      )
        return;
      // Preserve the browser's existing unsaved-form confirmation.
      if (document.querySelector('.game-editor[data-unsaved="true"]')) return;
      if (url.pathname === location.pathname && url.search === location.search)
        return;
      event.preventDefault();
      navigate(url.href);
    };
    document.addEventListener("click", click);
    window.addEventListener("popstate", update);
    return () => {
      document.removeEventListener("click", click);
      window.removeEventListener("popstate", update);
    };
  }, [adminSlug]);
  useEffect(() => {
    const title = {
      "/about": "Hakkımızda",
      "/advertise": "Reklam ve iş birliği",
      "/help": "Yardım merkezi",
      "/terms": "Kullanım koşulları",
      "/content-policy": "İçerik ve telif",
    }[location.pathname.replace(/\/$/, "")];
    document.title = title
      ? title + " · UTRZONE"
      : "UTRZONE — Oyunun dilini değiştir.";
    document.querySelector(".user-menu[open]")?.removeAttribute("open");
    const main = document.getElementById("main");
    main?.setAttribute("tabindex", "-1");
    main?.focus({ preventScroll: true });
    const target =
      location.hash && document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [route]);
  return route;
}

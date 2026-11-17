import { preferencesAllowed } from "./consent";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";
const SessionContext = createContext(null);
const get = (key) => {
  try {
    return preferencesAllowed() ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
};
export function SessionProvider({ children }) {
  const [token, setToken] = useState(() => {
      try {
        return (
          localStorage.getItem("utrzone-token") ||
          sessionStorage.getItem("utrzone-token") ||
          ""
        );
      } catch {
        return "";
      }
    }),
    [user, setUser] = useState(() => {
      try {
        if (localStorage.getItem("utrzone-token"))
          return JSON.parse(localStorage.getItem("utrzone-profile") || "null");
      } catch {}
      return null;
    }),
    [loading, setLoading] = useState(true);
  const [nsfw, setNsfw] = useState(() => get("utrzone-nsfw") === "true");
  const [favoriteIds, setFavoriteIds] = useState([]);
  useEffect(() => {
    if (!token) {
      setFavoriteIds([]);
      return;
    }
    setFavoriteIds([]);
    const c = new AbortController();
    api("/me/favorites/ids", { token, signal: c.signal })
      .then((d) => setFavoriteIds(d.ids))
      .catch(() => {});
    return () => c.abort();
  }, [token]);
  async function toggleFavorite(id) {
    const already = favoriteIds.includes(id);
    const d = await api("/games/" + id + "/favorite", {
      token,
      method: already ? "DELETE" : "POST",
    });
    setFavoriteIds((ids) =>
      d.favorite ? [...new Set([...ids, id])] : ids.filter((x) => x !== id),
    );
    return d;
  }
  function setSession(data) {
    setToken(data?.token || "");
    setUser(data?.user || null);
    if (data?.user) setNsfw(!!data.user.show_nsfw);
    try {
      if (data?.token) {
        localStorage.setItem("utrzone-token", data.token);
        localStorage.setItem("utrzone-profile", JSON.stringify(data.user));
      } else {
        localStorage.removeItem("utrzone-token");
        localStorage.removeItem("utrzone-profile");
      }
      sessionStorage.removeItem("utrzone-token");
    } catch {}
  }
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const c = new AbortController();
    setLoading(true);
    api("/me", { token, signal: c.signal })
      .then((u) => {
        setUser(u);
        try {
          localStorage.setItem("utrzone-profile", JSON.stringify(u));
        } catch {}
        setNsfw(u.show_nsfw);
        try {
          if (preferencesAllowed())
            localStorage.setItem("utrzone-nsfw", String(u.show_nsfw));
        } catch {}
      })
      .catch((e) => {
        if (e.status === 401) setSession(null);
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [token]);
  useEffect(() => {
    const sync = (e) => {
      if (e.key === "utrzone-token") {
        setToken(e.newValue || "");
        if (!e.newValue) setUser(null);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    const apply = (e) => {
      try {
        if (e.detail.preferences) {
          localStorage.setItem("utrzone-nsfw", String(nsfw));
          localStorage.setItem(
            "theme",
            document.documentElement.dataset.theme || "dark",
          );
        } else {
          localStorage.removeItem("utrzone-nsfw");
          localStorage.removeItem("theme");
        }
      } catch {}
    };
    window.addEventListener("utrzone-consent", apply);
    return () => window.removeEventListener("utrzone-consent", apply);
  }, [nsfw]);
  async function showNsfw(value) {
    setNsfw(value);
    try {
      if (preferencesAllowed())
        localStorage.setItem("utrzone-nsfw", String(value));
    } catch {}
    if (user) {
      try {
        const d = await api("/me", {
          method: "PATCH",
          token,
          body: { display_name: user.display_name, show_nsfw: value },
        });
        setUser(d.user);
      } catch {
        /* Local preference remains available if API is temporarily offline. */
      }
    }
  }
  async function logout() {
    try {
      if (token) await api("/auth/logout", { method: "POST", token });
    } finally {
      setSession(null);
    }
  }
  return (
    <SessionContext.Provider
      value={{
        token,
        user,
        loading,
        setSession,
        logout,
        nsfw,
        showNsfw,
        favoriteIds,
        toggleFavorite,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
export const useSession = () => useContext(SessionContext);
export function nextPath(fallback = "/") {
  const next = new URLSearchParams(location.search).get("next");
  return next?.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("\\") &&
    !/^\/(login|register|verify)(?:[/?#]|$)/.test(next)
    ? next
    : fallback;
}
export const roleLabel = {
  founder: "Kurucu",
  cofounder: "Yardımcı kurucu",
  moderator: "Moderatör",
  member: "Üye",
};

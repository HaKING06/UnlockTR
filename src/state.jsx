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
          localStorage.getItem("unlocktr-token") ||
          sessionStorage.getItem("unlocktr-token") ||
          ""
        );
      } catch {
        return "";
      }
    }),
    [user, setUser] = useState(() => {
      try {
        if (localStorage.getItem("unlocktr-token"))
          return JSON.parse(localStorage.getItem("unlocktr-profile") || "null");
      } catch {}
      return null;
    }),
    [loading, setLoading] = useState(true);
  const [nsfw, setNsfw] = useState(() => get("unlocktr-nsfw") === "true");
  function setSession(data) {
    setToken(data?.token || "");
    setUser(data?.user || null);
    try {
      if (data?.token) {
        localStorage.setItem("unlocktr-token", data.token);
        localStorage.setItem("unlocktr-profile", JSON.stringify(data.user));
      } else {
        localStorage.removeItem("unlocktr-token");
        localStorage.removeItem("unlocktr-profile");
      }
      sessionStorage.removeItem("unlocktr-token");
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
          localStorage.setItem("unlocktr-profile", JSON.stringify(u));
        } catch {}
        setNsfw(u.show_nsfw);
        try {
          if (preferencesAllowed())
            localStorage.setItem("unlocktr-nsfw", String(u.show_nsfw));
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
      if (e.key === "unlocktr-token") {
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
          localStorage.setItem("unlocktr-nsfw", String(nsfw));
          localStorage.setItem(
            "theme",
            document.documentElement.dataset.theme || "dark",
          );
        } else {
          localStorage.removeItem("unlocktr-nsfw");
          localStorage.removeItem("theme");
        }
      } catch {}
    };
    window.addEventListener("unlocktr-consent", apply);
    return () => window.removeEventListener("unlocktr-consent", apply);
  }, [nsfw]);
  async function showNsfw(value) {
    setNsfw(value);
    try {
      if (preferencesAllowed())
        localStorage.setItem("unlocktr-nsfw", String(value));
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
      value={{ token, user, loading, setSession, logout, nsfw, showNsfw }}
    >
      {children}
    </SessionContext.Provider>
  );
}
export const useSession = () => useContext(SessionContext);
export function nextPath(fallback = "/account") {
  const next = new URLSearchParams(location.search).get("next");
  return next?.startsWith("/") && !next.startsWith("//") && !next.includes("\\")
    ? next
    : fallback;
}
export const roleLabel = {
  founder: "Kurucu",
  cofounder: "Yardımcı kurucu",
  moderator: "Moderatör",
  member: "Üye",
};

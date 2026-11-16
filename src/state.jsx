import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";
const SessionContext = createContext(null);
const get = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
export function SessionProvider({ children }) {
  const [token, setToken] = useState(() => {
      try {
        return sessionStorage.getItem("unlocktr-token") || "";
      } catch {
        return "";
      }
    }),
    [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  const [nsfw, setNsfw] = useState(() => get("unlocktr-nsfw") === "true");
  function setSession(data) {
    setToken(data?.token || "");
    setUser(data?.user || null);
    try {
      if (data?.token) sessionStorage.setItem("unlocktr-token", data.token);
      else sessionStorage.removeItem("unlocktr-token");
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
        setNsfw(u.show_nsfw);
        try {
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
  async function showNsfw(value) {
    setNsfw(value);
    try {
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

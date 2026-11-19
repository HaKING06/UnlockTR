import React, { useState, useEffect } from "react";
import { Heart, Download, ArrowUpRight } from "lucide-react";
import { api } from "./api";
import { useSession } from "./state";
import { PageHeader, Protected, Notice } from "./ui";
export function FavoriteButton({ gameId, count: initial = 0 }) {
  const { user, favoriteIds, toggleFavorite } = useSession(),
    [count, setCount] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const active = favoriteIds.includes(gameId);
  async function toggle() {
    if (!user) {
      location.href =
        "/login?next=" +
        encodeURIComponent(location.pathname + location.search);
      return;
    }
    setBusy(true);
    try {
      const d = await toggleFavorite(gameId);
      setCount(d.count);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <span className="favorite-control">
      <button
        className={"favorite-button " + (active ? "selected" : "")}
        disabled={busy}
        aria-pressed={active}
        aria-label={active ? "Favorilerden çıkar" : "Favoriye ekle"}
        onClick={toggle}
      >
        <Heart size={16} fill={active ? "currentColor" : "none"} />
        <span>{count}</span>
      </button>
      {error && <small role="status">{error}</small>}
    </span>
  );
}
export function DownloadButton({
  gameId,
  provider,
  label,
  description,
  onError,
  className = "",
}) {
  const { token } = useSession(),
    [busy, setBusy] = useState(false);
  async function open() {
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    setBusy(true);
    try {
      const d = await api("/games/" + gameId + "/downloads/open", {
        token,
        method: "POST",
        body: { provider },
      });
      if (tab) tab.location.replace(d.url);
      else location.assign(d.url);
      window.dispatchEvent(
        new CustomEvent("utrzone-download", {
          detail: { gameId, count: d.count },
        }),
      );
    } catch (e) {
      tab?.close();
      onError?.(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      className={"download-option " + className}
      disabled={busy}
      onClick={open}
    >
      <span>
        <strong>{busy ? "Bağlantı hazırlanıyor…" : label}</strong>
        <small>{description}</small>
      </span>
      <Download size={18} />
    </button>
  );
}

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
export function FavoritesPage() {
  const s = useSession(),
    [rows, setRows] = useState([]),
    [page, setPage] = useState(1),
    [more, setMore] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(true);
  useEffect(() => {
    if (!s.user) return;
    const c = new AbortController();
    setBusy(true);
    api("/me/favorites?page=" + page, { token: s.token, signal: c.signal })
      .then((d) => {
        setRows((old) => (page === 1 ? d.games : [...old, ...d.games]));
        setMore(d.has_more);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setMessage(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setBusy(false);
      });
    return () => c.abort();
  }, [s.token, !!s.user, page]);
  return (
    <Protected user={s.user} loading={s.loading}>
      <section>
        <PageHeader
          eyebrow="KİŞİSEL KÜTÜPHANE"
          title="Tekrar dönmek istediğin hikâyeler."
          description={
            "Favorilerini bir arada tut. " +
            (s.user?.vip.active
              ? "VIP ile 1000 favori ve yeni sürüm e-posta bildirimi."
              : "Standart üyelikte 100 favori alanın var.")
          }
        />
        <Notice>{message}</Notice>
        <div className="favorite-list">
          {rows
            .filter((g) => s.favoriteIds.includes(g.id))
            .map((g) => (
              <article className="panel" key={g.id}>
                <div>
                  <small>
                    {g.engine} · v{g.version}
                  </small>
                  <h2>
                    <a href={"/game?id=" + g.id}>{g.title}</a>
                  </h2>
                  <p>{g.description}</p>
                  <span>
                    Son güncelleme:{" "}
                    {new Date(g.updated_at).toLocaleDateString("tr-TR")}
                  </span>
                </div>
                <div>
                  <FavoriteButton gameId={g.id} count={g.favorite_count} />
                  <a className="secondary" href={"/game?id=" + g.id}>
                    Oyun sayfası <ArrowUpRight size={15} />
                  </a>
                </div>
              </article>
            ))}
        </div>
        {!busy && !rows.length && (
          <div className="empty">
            <Heart size={32} />
            <h2>İlk favorini keşfet.</h2>
            <a href="/#library" className="primary">
              Kütüphaneye göz at
            </a>
          </div>
        )}
        {busy && <p role="status">Favoriler yükleniyor…</p>}
        {more && (
          <button
            className="secondary"
            disabled={busy}
            onClick={() => setPage((p) => p + 1)}
          >
            Daha fazla favori
          </button>
        )}
      </section>
    </Protected>
  );
}

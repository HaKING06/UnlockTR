import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Crown, Search, ArrowRight, RotateCw } from "lucide-react";
import { api } from "./api";
import { useSession } from "./state";
import { Notice } from "./ui";
import { RequestReview, statuses } from "./request-page";

const filters = [
  ["active", "Aktif bekleyenler"],
  ["pending", "Bekleyenler"],
  ["reviewing", "İncelenenler"],
  ["preparing", "Hazırlık aşamasında"],
  ["declined", "Reddedilenler"],
  ["completed", "Tamamlananlar"],
  ["all", "Tümü"],
];
const typeLabels = {
  translation: "Türkçe yama",
  mod: "Mod çalışması",
  update: "Yama güncellemesi",
};
const matches = (status, filter) =>
  filter === "all" ||
  status === filter ||
  (filter === "active" && ["pending", "reviewing"].includes(status));

export function RequestQueue() {
  const { token, user } = useSession();
  const [filter, setFilter] = useState("active");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [tick, setTick] = useState(0);
  const [data, setData] = useState(null);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(null);
  const lock = useRef(false);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    setError("");
    api(
      "/admin/requests?" +
        new URLSearchParams({
          view: "queue",
          status: filter,
          q: search,
          page: String(page),
        }),
      { token, signal: c.signal },
    )
      .then((result) => {
        if (!Array.isArray(result.requests) || !result.counts)
          throw new Error(
            "İstek yönetimi güncelleniyor. Yayın tamamlandıktan sonra tekrar dene.",
          );
        setData(result);
        setCounts(result.counts);
        const lastPage = Math.max(1, Math.ceil(result.total / 25));
        if (page > lastPage) setPage(lastPage);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [filter, search, page, tick, token]);
  function selectFilter(value) {
    if (value === filter) return;
    setFilter(value);
    setNotice(null);
    setPage(1);
    setExpanded(null);
    setData(null);
  }
  async function save(request, body) {
    if (lock.current) return false;
    lock.current = true;
    setSaving(request.id);
    setError("");
    setNotice(null);
    try {
      const result = await api("/admin/requests/" + request.id, {
        token,
        method: "PATCH",
        body,
      });
      const saved = { ...request, ...result.request };
      setData((current) =>
        current
          ? {
              ...current,
              requests: current.requests
                .map((r) => (r.id === request.id ? saved : r))
                .filter((r) => matches(r.status, filter)),
            }
          : current,
      );
      setExpanded(null);
      setNotice({
        title: request.title,
        status: saved.status,
        text: result.message,
      });
      setTick((v) => v + 1);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      lock.current = false;
      setSaving(null);
    }
  }
  return (
    <div className="request-queue" aria-busy={loading}>
      <p className="muted queue-intro">
        İstekleri durumlarına göre takip et. Ayrıntıları görmek için bir isteği
        aç.
      </p>
      <div
        className="queue-filters"
        role="group"
        aria-label="İstek durum filtreleri"
      >
        {filters.map(([value, label]) => (
          <button
            type="button"
            key={value}
            aria-pressed={filter === value}
            disabled={!!saving}
            onClick={() => selectFilter(value)}
          >
            <span>{label}</span>
            <b>{counts[value] ?? "—"}</b>
          </button>
        ))}
      </div>
      <form
        className="search queue-search"
        onSubmit={(e) => {
          e.preventDefault();
          setNotice(null);
          setSearch(query.trim());
          setPage(1);
          setExpanded(null);
          setData(null);
          setTick((v) => v + 1);
        }}
      >
        <Search size={16} />
        <input
          aria-label="İsteklerde oyun veya üye ara"
          placeholder="Oyun veya üye adı…"
          maxLength={150}
          value={query}
          disabled={!!saving}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button disabled={!!saving} aria-label="İstekleri ara">
          <ArrowRight size={16} />
        </button>
      </form>
      <Notice>{error}</Notice>
      {notice && (
        <div className="queue-success" role="status">
          <div>
            <strong>
              {notice.title} · {statuses[notice.status]}
            </strong>
            <p>{notice.text}</p>
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => selectFilter(notice.status)}
          >
            {statuses[notice.status]} listesinde gör <ArrowRight size={14} />
          </button>
        </div>
      )}
      {loading ? (
        <p className="queue-empty" role="status">
          İstekler yükleniyor…
        </p>
      ) : error && !data ? (
        <button className="secondary" onClick={() => setTick((v) => v + 1)}>
          <RotateCw size={15} /> Tekrar dene
        </button>
      ) : (
        <>
          {!data?.requests.length && (
            <div className="queue-empty">
              <strong>Bu listede istek yok.</strong>
              <p>
                {search
                  ? "Aramanı veya durum filtresini değiştirebilirsin."
                  : "Diğer durumları üstteki filtrelerden inceleyebilirsin."}
              </p>
            </div>
          )}
          {data?.requests.map((r) => (
            <article
              className={"queue-item" + (expanded === r.id ? " is-open" : "")}
              key={r.id + ":" + (r.revision || 0)}
            >
              <button
                type="button"
                className="queue-summary"
                aria-expanded={expanded === r.id}
                aria-controls={"request-" + r.id}
                onClick={() => setExpanded((v) => (v === r.id ? null : r.id))}
              >
                <span className="queue-item-title">
                  <strong>{r.title}</strong>
                  <small>
                    {r.display_name} ·{" "}
                    {typeLabels[r.request_type] || r.request_type} ·{" "}
                    {r.platform}
                  </small>
                </span>
                <span className="queue-item-labels">
                  {r.vip_priority && (
                    <span className="vip-badge">
                      <Crown size={12} /> VIP öncelikli
                    </span>
                  )}
                  <span className={"status-tag status-" + r.status}>
                    {statuses[r.status]}
                  </span>
                  <span className="queue-date">
                    {new Date(r.created_at).toLocaleDateString("tr-TR")}
                  </span>
                  <ChevronDown size={17} />
                </span>
              </button>
              <div
                id={"request-" + r.id}
                hidden={expanded !== r.id}
                className="queue-details"
              >
                {user.permissions.manage_games ? (
                  <RequestReview
                    request={r}
                    busy={!!saving}
                    onSave={(body) => save(r, body)}
                  />
                ) : (
                  <>
                    <p>{r.description}</p>
                    {r.admin_reply && (
                      <div className="request-reply">
                        <strong>Ekip yanıtı</strong>
                        <p>{r.admin_reply}</p>
                      </div>
                    )}
                    <p className="muted">
                      Bu rol istekleri görüntüleyebilir; durum değişikliği için
                      yayın yetkisi gerekir.
                    </p>
                  </>
                )}
              </div>
            </article>
          ))}
          {data && (
            <div className="pagination queue-pagination">
              <button
                className="secondary"
                disabled={page === 1 || !!saving}
                onClick={() => {
                  setPage((v) => v - 1);
                  setExpanded(null);
                }}
              >
                Önceki
              </button>
              <span>
                {page}. sayfa · {data.total} istek
              </span>
              <button
                className="secondary"
                disabled={!data.has_more || !!saving}
                onClick={() => {
                  setPage((v) => v + 1);
                  setExpanded(null);
                }}
              >
                Sonraki
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

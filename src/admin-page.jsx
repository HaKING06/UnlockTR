import React, { useEffect, useState } from "react";
import {
  Gamepad2,
  MessageSquare,
  Users,
  Crown,
  Plus,
  Settings,
  ShieldCheck,
  ArrowUpRight,
  Search,
  ClipboardList,
} from "lucide-react";
import { api, engines } from "./api";
import { useSession, roleLabel } from "./state";
import { Field, Notice, PageHeader, Protected } from "./ui";
const empty = {
  title: "",
  description: "",
  version: "1.0",
  cover_image_url: "",
  engine: "Ren'Py",
  is_adult: false,
  has_tr_patch: true,
  has_mod: false,
  trlink_url: "",
  pixeldrain_url: "",
  mediafire_url: "",
};
function GameEditor({ id, onDone }) {
  const { token } = useSession(),
    [draft, setDraft] = useState(empty),
    [ready, setReady] = useState(!id),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!id) return;
    const c = new AbortController();
    api("/admin/games/" + id, { token, signal: c.signal })
      .then((g) => {
        setDraft(
          Object.fromEntries(
            Object.keys(empty).map((k) => [k, g[k] ?? empty[k]]),
          ),
        );
        setReady(true);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setMessage(e.message);
      });
    return () => c.abort();
  }, [id, token]);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...draft };
      for (const k of ["trlink_url", "pixeldrain_url", "mediafire_url"])
        body[k] = body[k] || null;
      await api("/admin/games" + (id ? "/" + id : ""), {
        token,
        method: id ? "PATCH" : "POST",
        body,
      });
      onDone("Oyun " + (id ? "güncellendi." : "yayınlandı."));
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel editor-panel">
      <div className="section-head">
        <h2>{id ? "Projeyi düzenle" : "Yeni oyun yayınla"}</h2>
        <button className="secondary" onClick={() => onDone("")}>
          Listeye dön
        </button>
      </div>
      <Notice>{message}</Notice>
      {ready && (
        <form className="admin-grid" onSubmit={submit}>
          {[
            ["title", "Oyun adı"],
            ["version", "Sürüm"],
            ["cover_image_url", "Kapak görseli HTTPS URL"],
            ["trlink_url", "TRLink · Standart indirme URL"],
            ["pixeldrain_url", "Pixeldrain · VIP indirme URL"],
            ["mediafire_url", "MediaFire · Alternatif URL"],
          ].map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={draft[key]}
              type={key.includes("url") ? "url" : "text"}
              required={["title", "version", "cover_image_url"].includes(key)}
              maxLength={key === "title" ? 150 : key === "version" ? 40 : 2048}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
            />
          ))}
          <label className="field">
            Oyun motoru
            <select
              value={draft.engine}
              onChange={(e) => setDraft({ ...draft, engine: e.target.value })}
            >
              {engines.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <div className="checks">
            {[
              ["is_adult", "18+ / NSFW"],
              ["has_tr_patch", "TR Yama"],
              ["has_mod", "Mod"],
            ].map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={draft[key]}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.checked })
                  }
                />
                {label}
              </label>
            ))}
          </div>
          <Field
            label="Oyun açıklaması"
            textarea
            rows={7}
            maxLength={10000}
            required
            value={draft.description}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
          />
          <div className="editor-help">
            <p className="muted">
              En az bir indirme bağlantısı gerekli. VIP bağlantısı yalnızca
              aktif VIP üyelere backend tarafından gösterilir.
            </p>
            <button className="primary" disabled={busy}>
              {busy
                ? "Kaydediliyor…"
                : id
                  ? "Değişiklikleri kaydet"
                  : "Oyunu yayınla"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
export function AdminPage() {
  const s = useSession(),
    [tab, setTab] = useState("games"),
    [result, setResult] = useState(null),
    [q, setQ] = useState(""),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [tick, setTick] = useState(0),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [editor, setEditor] = useState(
      () => new URLSearchParams(location.search).get("edit") || "",
    );
  const allowed = s.user?.permissions.manage_users
    ? ["games", "comments", "requests", "users", "audit"]
    : s.user?.permissions.manage_games
      ? ["games", "comments", "requests"]
      : s.user?.permissions.moderate_comments
        ? ["comments", "requests"]
        : [];
  const active = allowed.includes(tab) ? tab : allowed[0];
  const data = result && result.tab === active ? result.data : null;
  useEffect(() => {
    if (!active || !s.token) return;
    const c = new AbortController();
    setResult(null);
    api(
      "/admin/" + active + "?q=" + encodeURIComponent(search) + "&page=" + page,
      { token: s.token, signal: c.signal },
    )
      .then((data) => setResult({ tab: active, data }))
      .catch((e) => {
        if (e.name !== "AbortError") setMessage(e.message);
      });
    return () => c.abort();
  }, [active, search, page, tick, s.token]);
  async function mutate(path, body) {
    setBusy(true);
    setMessage("");
    try {
      await api("/admin/" + path, { method: "PATCH", token: s.token, body });
      setMessage("Değişiklik kaydedildi.");
      setTick((t) => t + 1);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  const labels = {
    games: ["Oyunlar", Gamepad2],
    comments: ["Yorumlar", MessageSquare],
    requests: ["Oyun istekleri", ClipboardList],
    users: ["Üyeler ve VIP", Users],
    audit: ["İşlem geçmişi", ShieldCheck],
  };
  return (
    <Protected user={s.user} loading={s.loading}>
      {s.user &&
        (allowed.length ? (
          <section className="management">
            <PageHeader
              eyebrow="YÖNETİM MERKEZİ"
              title="Topluluğun kontrol noktası."
              description={roleLabel[s.user.role] + " · " + s.user.email}
            >
              <span className="role-tag">
                <ShieldCheck size={14} />
                {roleLabel[s.user.role]}
              </span>
            </PageHeader>
            <nav className="manage-tabs">
              {allowed.map((key) => {
                const Icon = labels[key][1];
                return (
                  <button
                    className={active === key ? "active" : ""}
                    key={key}
                    onClick={() => {
                      setTab(key);
                      setPage(1);
                      setEditor("");
                      setSearch("");
                      setQ("");
                      setMessage("");
                    }}
                  >
                    <Icon size={16} />
                    {labels[key][0]}
                  </button>
                );
              })}
            </nav>
            <Notice>{message}</Notice>
            {active === "games" && s.user.permissions.manage_games && editor ? (
              <GameEditor
                key={editor}
                id={editor === "new" ? null : editor}
                onDone={(msg) => {
                  setMessage(msg);
                  setEditor("");
                  history.replaceState({}, "", "/manage");
                  setTick((t) => t + 1);
                }}
              />
            ) : (
              <section className="panel manage-content">
                <div className="section-head">
                  <h2>{labels[active]?.[0]}</h2>
                  {active === "games" && (
                    <button
                      className="primary"
                      onClick={() => setEditor("new")}
                    >
                      <Plus size={15} />
                      Oyun ekle
                    </button>
                  )}
                </div>
                {["games", "users"].includes(active) && (
                  <form
                    className="search manage-search"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setPage(1);
                      setSearch(q);
                    }}
                  >
                    <Search size={16} />
                    <input
                      aria-label={
                        active === "users"
                          ? "E-posta veya ad ile üye ara"
                          : "Yönetimde oyun ara"
                      }
                      placeholder={
                        active === "users"
                          ? "Kullanıcının e-postası veya adı…"
                          : "Oyun adı ara…"
                      }
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      maxLength={active === "users" ? 254 : 150}
                    />
                    <button aria-label="Yönetimde ara">
                      <Search size={16} />
                    </button>
                  </form>
                )}
                {!data ? (
                  <p className="muted" role="status">
                    Yükleniyor…
                  </p>
                ) : (
                  <>
                    {active === "games" && (
                      <div className="admin-game-list">
                        {data.games.map((g) => (
                          <article key={g.id}>
                            <div>
                              <span className="eyebrow">
                                {g.engine} · v{g.version}
                              </span>
                              <h3>{g.title}</h3>
                              <p className="muted small">
                                {g.is_adult ? "18+ içerik" : "Genel içerik"} ·{" "}
                                {g.has_tr_patch ? "TR Yama " : ""}
                                {g.has_mod ? "Mod" : ""}
                              </p>
                            </div>
                            <div>
                              <a
                                className="secondary"
                                href={"/game?id=" + g.id}
                              >
                                <ArrowUpRight size={15} />
                                Görüntüle
                              </a>
                              <button
                                className="primary"
                                onClick={() => setEditor(g.id)}
                              >
                                <Settings size={15} />
                                Düzenle
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                    {active === "comments" &&
                      data.comments.map((c) => (
                        <form
                          className="comment moderation-row"
                          key={c.id}
                          onSubmit={(e) => {
                            e.preventDefault();
                            const f = new FormData(e.currentTarget);
                            mutate("comments/" + c.id, {
                              body: f.get("body"),
                              is_deleted: f.get("is_deleted") === "on",
                            });
                          }}
                        >
                          <strong>
                            {c.title} · {c.display_name}
                          </strong>
                          <Field
                            label="Yorumu düzenle"
                            textarea
                            name="body"
                            defaultValue={c.body}
                            maxLength={2000}
                            required
                            rows={3}
                          />
                          <div className="moderation-actions">
                            <label>
                              <input
                                type="checkbox"
                                name="is_deleted"
                                defaultChecked={c.is_deleted}
                              />
                              Yorumu gizle
                            </label>
                            <button className="secondary" disabled={busy}>
                              Kaydet
                            </button>
                          </div>
                        </form>
                      ))}
                    {active === "requests" &&
                      data.map((r) => (
                        <article className="comment" key={r.id}>
                          <strong>
                            {r.title} · {r.display_name}
                          </strong>
                          <p>{r.description}</p>
                          {s.user.permissions.manage_games ? (
                            <label className="field">
                              İstek durumu
                              <select
                                value={r.status}
                                disabled={busy}
                                onChange={(e) =>
                                  mutate("requests/" + r.id, {
                                    status: e.target.value,
                                  })
                                }
                              >
                                {[
                                  ["pending", "Bekliyor"],
                                  ["reviewing", "İnceleniyor"],
                                  ["completed", "Tamamlandı"],
                                  ["declined", "Reddedildi"],
                                ].map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          ) : (
                            <span className="muted">{r.status}</span>
                          )}
                        </article>
                      ))}
                    {active === "users" &&
                      data.map((u) => (
                        <article key={u.id} className="user-admin-card">
                          <div>
                            <span className="avatar">
                              {u.display_name
                                .slice(0, 1)
                                .toLocaleUpperCase("tr")}
                            </span>
                            <div>
                              <h3>{u.display_name}</h3>
                              <p>{u.email}</p>
                            </div>
                            <span className="role-tag">
                              {roleLabel[u.role]}
                            </span>
                          </div>
                          {u.role === "founder" ? (
                            <p className="muted">
                              Tam yetki · Sınırsız VIP · Kurucu rolü
                              değiştirilemez.
                            </p>
                          ) : (
                            <div className="user-controls">
                              <label className="field">
                                Ekip rolü
                                <select
                                  value={u.role}
                                  disabled={busy}
                                  onChange={(e) =>
                                    mutate("users/" + u.id + "/role", {
                                      role: e.target.value,
                                    })
                                  }
                                >
                                  <option value="member">Üye</option>
                                  <option value="moderator">Moderatör</option>
                                  <option value="cofounder">
                                    Yardımcı kurucu
                                  </option>
                                </select>
                              </label>
                              <div>
                                <span className="vip-badge">
                                  <Crown size={13} />
                                  {u.vip.lifetime
                                    ? "Ekip · Sınırsız VIP"
                                    : u.vip.active
                                      ? "VIP · " +
                                        new Date(
                                          u.vip.expires_at,
                                        ).toLocaleDateString("tr-TR")
                                      : "VIP yok"}
                                </span>
                                {!u.vip.lifetime && (
                                  <div className="vip-grants">
                                    <button
                                      className="secondary"
                                      disabled={busy}
                                      onClick={() =>
                                        mutate("users/" + u.id + "/vip", {
                                          plan: "monthly",
                                        })
                                      }
                                    >
                                      +1 ay VIP
                                    </button>
                                    <button
                                      className="secondary"
                                      disabled={busy}
                                      onClick={() =>
                                        mutate("users/" + u.id + "/vip", {
                                          plan: "yearly",
                                        })
                                      }
                                    >
                                      +1 yıl VIP
                                    </button>
                                    <button
                                      className="text-button"
                                      disabled={busy}
                                      onClick={() =>
                                        mutate("users/" + u.id + "/vip", {
                                          plan: "none",
                                        })
                                      }
                                    >
                                      VIP’yi kaldır
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </article>
                      ))}
                    {active === "audit" &&
                      data.map((a) => (
                        <article className="audit-row" key={a.id}>
                          <strong>{a.display_name || "Sistem"}</strong>
                          <code>{a.action}</code>
                          <time>
                            {new Date(a.created_at).toLocaleString("tr-TR")}
                          </time>
                        </article>
                      ))}
                    {((Array.isArray(data) && !data.length) ||
                      (active === "games" && !data.games.length) ||
                      (active === "comments" && !data.comments.length)) && (
                      <p className="muted">
                        Kayıt bulunamadı. Üye aramasında yalnızca ilk 50 eşleşme
                        gösterilir.
                      </p>
                    )}
                    {["games", "comments"].includes(active) && (
                      <div className="pagination">
                        <button
                          className="secondary"
                          disabled={page === 1}
                          onClick={() => setPage((p) => p - 1)}
                        >
                          Önceki
                        </button>
                        <span>{page}. sayfa</span>
                        <button
                          className="secondary"
                          disabled={!data.has_more}
                          onClick={() => setPage((p) => p + 1)}
                        >
                          Sonraki
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </section>
        ) : (
          <section className="empty">
            <ShieldCheck size={36} />
            <h1>Bu alana erişimin yok.</h1>
            <p>
              Yalnızca yetkilendirilmiş ekip üyeleri yönetim alanını
              kullanabilir.
            </p>
            <a className="secondary" href="/">
              Kütüphaneye dön
            </a>
          </section>
        ))}
    </Protected>
  );
}

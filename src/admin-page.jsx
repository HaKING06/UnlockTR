import { Select } from "./select";
import { useConfirm } from "./confirm-dialog";
import { GameEditor } from "./game-editor";
import { RequestReview } from "./request-page";
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
export function AdminPage() {
  const confirm = useConfirm();
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
  const [editorDirty, setEditorDirty] = useState(false);
  const allowed = s.user?.permissions.manage_users
    ? ["games", "comments", "requests", "users", "notifications", "audit"]
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
  async function removeComment(id) {
    if (
      !(await confirm({
        title: "Yorumu kalıcı olarak sil?",
        description: "Yorum metni kaldırılır; işlem geri alınamaz.",
        confirmLabel: "Yorumu sil",
        danger: true,
      }))
    )
      return;
    setBusy(true);
    try {
      await api("/admin/comments/" + id + "/permanent", {
        token: s.token,
        method: "DELETE",
        body: { confirmed: true },
      });
      setTick((t) => t + 1);
      setMessage("Yorum silindi.");
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
    notifications: ["E-posta kuyruğu", ClipboardList],
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
              <div className="management-quick-actions">
                {" "}
                {s.user.permissions.manage_games && (
                  <a className="secondary" href="/mail">
                    Kurumsal e-posta hazırla
                  </a>
                )}
                {s.user.permissions.manage_coins && (
                  <a className="secondary" href="/manage-coins">
                    UCoin yönetimi
                  </a>
                )}
                {s.user.permissions.manage_games && (
                  <a className="secondary" href="/reports">
                    Proje raporları
                  </a>
                )}
                <span className="role-tag">
                  <ShieldCheck size={14} />
                  {roleLabel[s.user.role]}
                </span>
              </div>{" "}
            </PageHeader>
            <nav className="manage-tabs">
              {allowed.map((key) => {
                const Icon = labels[key][1];
                return (
                  <button
                    className={active === key ? "active" : ""}
                    key={key}
                    onClick={async () => {
                      if (
                        editorDirty &&
                        !(await confirm({
                          title: "Sekmeyi değiştir?",
                          description:
                            "Kaydedilmemiş oyun değişiklikleri kaybolacak.",
                          confirmLabel: "Sekmeyi değiştir",
                          danger: true,
                        }))
                      )
                        return;
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
                onDirtyChange={setEditorDirty}
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
                            <button
                              type="button"
                              className="text-danger"
                              disabled={busy}
                              onClick={() => removeComment(c.id)}
                            >
                              Yorumu sil
                            </button>
                          </div>
                        </form>
                      ))}
                    {active === "requests" &&
                      data.map((r) =>
                        s.user.permissions.manage_games ? (
                          <RequestReview
                            key={r.id + ":" + (r.revision || 0)}
                            request={r}
                            busy={busy}
                            onSave={(body) => mutate("requests/" + r.id, body)}
                          />
                        ) : (
                          <article className="comment" key={r.id}>
                            <strong>
                              {r.title} · {r.display_name}
                            </strong>
                            {r.vip_priority && (
                              <span className="vip-badge">VIP öncelikli</span>
                            )}
                            <p>{r.description}</p>
                            <span className="muted">{r.status}</span>
                          </article>
                        ),
                      )}
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
                                <Select
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
                                </Select>
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
                    {active === "notifications" &&
                      data.map((n) => (
                        <article key={n.id} className="audit-row">
                          <strong>{n.recipient}</strong>
                          <code>{n.kind}</code>
                          <span className={"status-tag status-" + n.status}>
                            {n.status} · {n.attempts} deneme
                          </span>
                          {n.status === "dead" && (
                            <button
                              className="secondary"
                              disabled={busy}
                              onClick={async () => {
                                try {
                                  await api(
                                    "/admin/notifications/" + n.id + "/retry",
                                    { token: s.token, method: "POST" },
                                  );
                                  setTick((t) => t + 1);
                                } catch (e) {
                                  setMessage(e.message);
                                }
                              }}
                            >
                              Yeniden dene
                            </button>
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

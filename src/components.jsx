import React, { useEffect, useState, useRef } from "react";
import {
  Download,
  Gamepad2,
  Search,
  ShieldCheck,
  X,
  Plus,
  LockKeyhole,
  MessageSquare,
  ArrowRight,
  Eye,
  EyeOff,
  FileText,
  Layers,
  UserRound,
} from "lucide-react";

import { api, ADMIN, engines } from "./api";
function Field({ label, ...props }) {
  return (
    <label className="field">
      {label}
      <input {...props} />
    </label>
  );
}
export function Modal({ title, onClose, children }) {
  const dialog = useRef(null);
  useEffect(() => {
    dialog.current.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="overlay"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <section className="modal">
        <div className="modal-kicker">
          <span className="mini-logo">
            <Gamepad2 size={15} />
          </span>{" "}
          UNLOCKTR / TOPLULUK
        </div>
        <header>
          <h2>{title}</h2>
          <button
            autoFocus
            className="icon"
            aria-label="Kapat"
            onClick={onClose}
          >
            <X />
          </button>
        </header>
        {children}
      </section>
    </dialog>
  );
}
export function Auth({ onLogin }) {
  const [mode, setMode] = useState("login"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const f = new FormData(e.currentTarget);
    try {
      const d = await api("/auth/" + mode, {
        method: "POST",
        body: Object.fromEntries(f),
      });
      if (mode === "login") onLogin(d);
      else setMessage(d.message);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="auth-intro">
        <div className="auth-emblem">
          <UserRound size={29} />
        </div>
        <h3>Bir sonraki hikâyeye birlikte.</h3>
        <p className="muted">
          Oyunları keşfet. Fikrini paylaş. Topluluğa katıl.
        </p>
      </div>
      <div className="tabs">
        {[
          ["login", "Giriş yap"],
          ["register", "Üye ol"],
          ["resend", "Yeniden gönder"],
        ].map(([key, label]) => (
          <button
            key={key}
            aria-pressed={mode === key}
            className={mode === key ? "active" : ""}
            onClick={() => {
              setMode(key);
              setMessage("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="muted">
        Yorum yazmak ve oyun istemek için e-postanı doğrula.
      </p>
      <form onSubmit={submit}>
        {mode === "register" && (
          <Field
            label="Görünen ad"
            name="display_name"
            minLength={2}
            maxLength={40}
            required
            autoComplete="nickname"
          />
        )}
        <Field
          label="E-posta"
          name="email"
          type="email"
          maxLength={254}
          required
          autoComplete="email"
        />
        {mode !== "resend" && (
          <Field
            label="Şifre (en az 12 karakter)"
            name="password"
            type="password"
            minLength={12}
            maxLength={128}
            required
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
        )}
        <button className="primary" disabled={busy}>
          {busy
            ? "Bekle…"
            : mode === "login"
              ? "Giriş yap"
              : mode === "register"
                ? "Hesap oluştur"
                : "Doğrulama e-postası gönder"}
          <ArrowRight size={17} />
        </button>
        <p role="status">{message}</p>
      </form>
    </>
  );
}
export function Verify() {
  const [message, setMessage] = useState(
      "Bağlantını onaylamak için aşağıdaki düğmeye bas.",
    ),
    [busy, setBusy] = useState(false);
  async function verify() {
    setBusy(true);
    const token = new URLSearchParams(location.search).get("token");
    history.replaceState({}, "", "/verify");
    try {
      const d = await api("/auth/verify", { method: "POST", body: { token } });
      setMessage(d.message);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel narrow">
      <ShieldCheck size={38} />
      <h1>E-posta doğrulama</h1>
      <p role="status">{message}</p>
      <button className="primary" disabled={busy} onClick={verify}>
        E-postamı doğrula
      </button>
      <a href="/">Ana sayfaya dön</a>
    </section>
  );
}
export function RequestForm({ token }) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    try {
      await api("/requests", {
        token,
        method: "POST",
        body: Object.fromEntries(new FormData(form)),
      });
      setMessage("Oyun isteğin alındı. Teşekkürler!");
      form.reset();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <p className="muted">Sırada hangi oyunu Türkçe oynamak istersin?</p>
      <Field label="Oyun adı" name="title" maxLength={150} required />
      <label className="field">
        İsteğin
        <textarea name="description" maxLength={2000} required rows={4} />
      </label>
      <button className="primary" disabled={busy}>
        İsteği gönder
        <Plus size={17} />
      </button>
      <p role="status">{message}</p>
    </form>
  );
}
export function GameDetail({ game, token, onAuth }) {
  const [comments, setComments] = useState([]),
    [message, setMessage] = useState(""),
    [reveal, setReveal] = useState(false),
    [busy, setBusy] = useState(false);
  const [commentStatus, setCommentStatus] = useState("loading");
  useEffect(() => {
    const controller = new AbortController();
    setCommentStatus("loading");
    api("/games/" + game.id + "/comments", { signal: controller.signal })
      .then((data) => {
        setComments(data);
        setCommentStatus("ready");
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setMessage(e.message);
          setCommentStatus("error");
        }
      });
    return () => controller.abort();
  }, [game.id]);
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    try {
      await api("/games/" + game.id + "/comments", {
        token,
        method: "POST",
        body: Object.fromEntries(new FormData(form)),
      });
      form.reset();
      setComments(await api("/games/" + game.id + "/comments"));
      setCommentStatus("ready");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Cover game={game} reveal={reveal} onReveal={() => setReveal(true)} />
      <div className="tags">
        <span>{game.engine}</span>
        <span>v{game.version}</span>
        {game.has_tr_patch && (
          <span className="badge-patch">
            <FileText size={11} />
            TR Yama
          </span>
        )}
        {game.has_mod && (
          <span className="badge-mod">
            <Layers size={11} />
            Mod
          </span>
        )}
      </div>
      <p className="description">{game.description}</p>
      <h3>İndirme bağlantıları</h3>
      <p className="muted small">
        Harici indirme sayfası yeni sekmede açılır. Dosya güvenliğini ve oyun
        sürümünü kontrol et.
      </p>
      <div className="downloads">
        {[
          ["trlink_url", "TRLink · Reklamlı"],
          ["pixeldrain_url", "Pixeldrain · VIP"],
          ["mediafire_url", "MediaFire · Alternatif"],
        ].map(
          ([key, label]) =>
            game[key] && (
              <a
                className="secondary"
                key={key}
                href={game[key]}
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
                <Download size={16} />
              </a>
            ),
        )}
      </div>
      <h3>Topluluk yorumları</h3>
      {commentStatus === "loading" && (
        <p className="muted" role="status">
          Yorumlar yükleniyor…
        </p>
      )}
      {commentStatus === "ready" && comments.length === 0 && (
        <p className="muted">Henüz yorum yok. İlk yorumu sen yaz.</p>
      )}
      {comments.map((c) => (
        <article className="comment" key={c.id}>
          <div className="comment-author">
            <span className="avatar">
              {c.display_name.slice(0, 1).toLocaleUpperCase("tr")}
            </span>
            <div>
              <strong>{c.display_name}</strong>
              <time>{new Date(c.created_at).toLocaleDateString("tr-TR")}</time>
            </div>
          </div>
          <p>{c.body}</p>
        </article>
      ))}
      {token ? (
        <form onSubmit={submit}>
          <label className="field">
            Yorumun
            <textarea name="body" maxLength={2000} required rows={3} />
          </label>
          <button disabled={busy} className="primary">
            Yorum gönder
          </button>
        </form>
      ) : (
        <button className="secondary" onClick={onAuth}>
          <LockKeyhole size={16} />
          Yorum yazmak için giriş yap
        </button>
      )}
      <p role="status">{message}</p>
    </>
  );
}
export function Cover({ game, reveal, onReveal }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={"cover " + (game.is_adult && !reveal ? "restricted" : "")}>
      {!failed ? (
        <img
          src={game.cover_image_url}
          alt={game.is_adult ? "Yetişkin içerik kapağı" : game.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="cover-fallback">
          <Gamepad2 size={45} />
          <span>UNLOCKTR</span>
        </div>
      )}
      {game.is_adult && !reveal && (
        <div className="adult">
          <div className="adult-symbol">
            <EyeOff size={22} />
          </div>
          <strong>Yetişkin içerik</strong>
          <p>Bu oyun 18+ içerik barındırır.</p>
          <button onClick={onReveal}>
            <Eye size={13} />
            18 yaşından büyüğüm · Göster
          </button>
          <span className="nsfw-mark">18+ / NSFW</span>
        </div>
      )}
    </div>
  );
}
const blankGame = {
  title: "",
  description: "",
  version: "1.0",
  cover_image_url: "",
  engine: "Other",
  is_adult: false,
  has_tr_patch: true,
  has_mod: false,
  trlink_url: "",
  pixeldrain_url: "",
  mediafire_url: "",
};
export function Admin() {
  const [token, setToken] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [comments, setComments] = useState([]),
    [requests, setRequests] = useState([]);
  const [draft, setDraft] = useState(blankGame);
  async function load(t = token) {
    try {
      const [c, r] = await Promise.all([
        api("/" + ADMIN + "/comments", { token: t }),
        api("/" + ADMIN + "/requests", { token: t }),
      ]);
      setComments(c);
      setRequests(r);
    } catch (e) {
      setMessage(e.message);
    }
  }
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const d = await api("/" + ADMIN + "/login", {
        method: "POST",
        body: Object.fromEntries(new FormData(e.currentTarget)),
      });
      setToken(d.token);
      setMessage("");
      await load(d.token);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...draft };
      for (const key of ["trlink_url", "pixeldrain_url", "mediafire_url"])
        body[key] = body[key] || null;
      await api("/" + ADMIN + "/games", { token, method: "POST", body });
      setDraft(blankGame);
      setMessage("Oyun yayınlandı.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel admin-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">KURUCU ALANI</p>
          <h1>İçerik yönetimi</h1>
        </div>
        {token && (
          <button className="secondary" onClick={() => setToken("")}>
            Çıkış yap
          </button>
        )}
      </div>
      {!token ? (
        <form onSubmit={login} className="narrow admin-login">
          <div className="auth-emblem">
            <ShieldCheck size={30} />
          </div>
          <h2>Kurucu oturumu</h2>
          <p className="muted">
            İçerik ve topluluk yönetimi için yetkili giriş.
          </p>
          <Field
            label="Admin anahtarı"
            name="secret"
            type="password"
            required
            autoComplete="off"
          />
          <button className="primary" disabled={busy}>
            Güvenli giriş
          </button>
        </form>
      ) : (
        <>
          <div className="admin-overview">
            <div>
              <Gamepad2 />
              <span>
                Yayın merkezi<strong>Oyun ekle</strong>
              </span>
            </div>
            <div>
              <MessageSquare />
              <span>
                Yorumlar
                <strong>
                  {comments.filter((c) => !c.is_deleted).length} görünür
                </strong>
              </span>
            </div>
            <div>
              <FileText />
              <span>
                Oyun istekleri<strong>{requests.length} istek</strong>
              </span>
            </div>
          </div>
          <h2 className="admin-heading">
            <Plus size={20} />
            Yeni oyun ekle
          </h2>
          <form onSubmit={save} className="admin-grid">
            {[
              ["title", "Oyun adı"],
              ["version", "Sürüm"],
              ["cover_image_url", "Kapak görseli HTTPS URL"],
              ["trlink_url", "TRLink URL"],
              ["pixeldrain_url", "Pixeldrain URL"],
              ["mediafire_url", "MediaFire URL"],
            ].map(([key, label]) => (
              <Field
                key={key}
                label={label}
                value={draft[key]}
                type={key.includes("url") ? "url" : "text"}
                required={["title", "version", "cover_image_url"].includes(key)}
                maxLength={
                  key === "title" ? 150 : key === "version" ? 40 : 2048
                }
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              />
            ))}
            <label className="field">
              Oyun motoru
              <select
                value={draft.engine}
                onChange={(e) => setDraft({ ...draft, engine: e.target.value })}
              >
                {engines.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field full">
              Açıklama
              <textarea
                rows={4}
                maxLength={10000}
                required
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </label>
            <div className="checks full">
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
            <button disabled={busy} className="primary">
              Oyunu yayınla
            </button>
          </form>
          <div className="section-head">
            <h2>Yorum moderasyonu</h2>
            <button className="secondary" onClick={() => load()}>
              Yenile
            </button>
          </div>
          {comments.length === 0 && <p className="muted">Henüz yorum yok.</p>}
          {comments.map((c) => (
            <article className="comment" key={c.id}>
              <strong>
                {c.title} · {c.display_name}
              </strong>
              <p>{c.body}</p>
              <button
                className="secondary"
                disabled={c.is_deleted}
                onClick={async () => {
                  try {
                    await api("/" + ADMIN + "/comments/" + c.id, {
                      token,
                      method: "DELETE",
                    });
                    await load();
                  } catch (e) {
                    setMessage(e.message);
                  }
                }}
              >
                {c.is_deleted ? "Gizlendi" : "Yorumu gizle"}
              </button>
            </article>
          ))}
          <h2>Oyun istekleri</h2>
          {requests.length === 0 && (
            <p className="muted">Henüz oyun isteği yok.</p>
          )}
          {requests.map((r) => (
            <article key={r.id} className="comment">
              <strong>
                {r.title} · {r.display_name}
              </strong>
              <p>{r.description}</p>
              <span className="muted">{r.status}</span>
            </article>
          ))}
        </>
      )}
      <p role="status">{message}</p>
    </section>
  );
}

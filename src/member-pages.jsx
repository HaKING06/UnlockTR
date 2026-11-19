import { GameGallery } from "./gallery";
import { useConfirm } from "./confirm-dialog";
import { FavoriteButton, DownloadButton } from "./social-ui";
import { EarlyAccess } from "./early-access";
import { AccountDeletion } from "./account-deletion";
import { modLabel } from "./game-data";
import React, { useEffect, useState } from "react";
import {
  Crown,
  ShieldCheck,
  Download,
  ArrowUpRight,
  Settings,
  Eye,
  UserRound,
  KeyRound,
  Trash2,
} from "lucide-react";
import { api } from "./api";
import { useSession, roleLabel } from "./state";
import { Field, Notice, PageHeader, Protected } from "./ui";
import { Cover } from "./components";
export function AccountPage() {
  const s = useSession(),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function save(e, path, method = "POST") {
    e.preventDefault();
    setBusy(true);
    let body = Object.fromEntries(new FormData(e.currentTarget));
    if (path === "/me")
      for (const key of [
        "show_nsfw",
        "announcements_enabled",
        "favorite_updates_enabled",
      ])
        body[key] = body[key] === "on";
    try {
      const d = await api(path, { token: s.token, method, body });
      if (d.token) s.setSession(d);
      if (method === "DELETE") {
        s.setSession(null);
        location.href = "/login";
        return;
      }

      setMessage(d.message || "Ayarların kaydedildi.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Protected user={s.user} loading={s.loading}>
      {s.user && (
        <section className="account-page">
          <PageHeader
            eyebrow="HESABIM"
            title="Kontrol sende."
            description="Profilini, güvenliğini ve içerik tercihlerini yönet."
          />
          <div className="profile-banner">
            <span className="avatar large">
              {s.user.display_name.slice(0, 1).toLocaleUpperCase("tr")}
            </span>
            <div>
              <h2>{s.user.display_name}</h2>
              <p>{s.user.email}</p>
            </div>
            <span className="role-tag">{roleLabel[s.user.role]}</span>
            {s.user.vip.active && (
              <span className="vip-badge">
                <Crown size={13} />
                {s.user.vip.lifetime ? "Sınırsız VIP" : "VIP"}
              </span>
            )}
          </div>
          <section className="panel identity-panel">
            <span className="eyebrow">UTRZONE KİMLİĞİN</span>
            <h2>{roleLabel[s.user.role]} olarak buradasın.</h2>
            <p className="muted">
              {
                {
                  founder:
                    "Tüm yönetim araçlarına, ekip rollerine ve VIP atamalarına erişebilirsin.",
                  cofounder:
                    "Oyunları yayınlayabilir, yorumları ve oyun isteklerini yönetebilirsin.",
                  moderator:
                    "Topluluk yorumlarını düzenleyebilir ve uygunsuz yorumları gizleyebilirsin.",
                  member:
                    "Oyunları keşfedebilir, yorum paylaşabilir ve oyun isteği oluşturabilirsin.",
                }[s.user.role]
              }
            </p>
            <div className="tags">
              <span>E-posta doğrulandı</span>
              <span>
                {s.user.vip.active ? "VIP erişimi etkin" : "Standart üyelik"}
              </span>
            </div>
          </section>
          <Notice>{message}</Notice>
          <div className="settings-grid">
            <section className="panel">
              <h2>
                <UserRound size={19} />
                Profil ve tercihler
              </h2>
              <form onSubmit={(e) => save(e, "/me", "PATCH")}>
                <Field
                  label="Görünen ad"
                  name="display_name"
                  defaultValue={s.user.display_name}
                  minLength={2}
                  maxLength={40}
                  required
                />
                <label className="switch-row">
                  <span>
                    <strong>Yetişkin kapaklarını göster</strong>
                    <small>18 yaşından büyük olduğunu onaylarsın.</small>
                  </span>
                  <input
                    type="checkbox"
                    name="show_nsfw"
                    defaultChecked={s.nsfw}
                    key={String(s.nsfw)}
                  />
                </label>
                <label className="switch-row">
                  <span>
                    <strong>Platform duyuruları</strong>
                    <small>Yeni özellik ve topluluk bilgilendirmeleri.</small>
                  </span>
                  <input
                    type="checkbox"
                    name="announcements_enabled"
                    defaultChecked={s.user.announcements_enabled !== false}
                  />
                </label>
                <label className="switch-row">
                  <span>
                    <strong>Favori sürüm bildirimleri</strong>
                    <small>
                      VIP avantajı: favori yamaların sürümü değişince e-posta.
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    name="favorite_updates_enabled"
                    defaultChecked={s.user.favorite_updates_enabled !== false}
                  />
                </label>
                <button className="primary" disabled={busy}>
                  Ayarları kaydet
                </button>
              </form>
            </section>
            <section className="panel">
              <h2>
                <KeyRound size={19} />
                Şifre değiştir
              </h2>
              <form onSubmit={(e) => save(e, "/me/password")}>
                <Field
                  label="Mevcut şifre"
                  name="current_password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
                <Field
                  label="Yeni şifre (en az 12 karakter)"
                  name="password"
                  type="password"
                  minLength={12}
                  maxLength={72}
                  autoComplete="new-password"
                  required
                />
                <button className="secondary" disabled={busy}>
                  Şifreyi güncelle
                </button>
              </form>
            </section>
            <section className="panel">
              <h2>
                <Crown size={19} />
                VIP üyeliğin
              </h2>
              <p className="muted">
                {s.user.vip.lifetime
                  ? "Ekip hesabın sayesinde sınırsız VIP erişimin var."
                  : s.user.vip.active
                    ? "VIP bitişi: " +
                      new Date(s.user.vip.expires_at).toLocaleString("tr-TR")
                    : "Henüz aktif VIP üyeliğin yok."}
              </p>
              <a href="/vip" className="secondary">
                VIP avantajlarını keşfet
                <ArrowUpRight size={15} />
              </a>
            </section>
            <section className="panel danger-zone">
              <h2>
                <Trash2 size={19} />
                Hesabı sil
              </h2>
              {s.user.role === "founder" ? (
                <p className="muted">
                  Kurucu hesabı panelden silinemez. Sahiplik devri ayrı olarak
                  yapılmalıdır.
                </p>
              ) : (
                <>
                  <p className="muted">
                    Profilin ve e-postan kaldırılır, oturumların kapanır,
                    isteklerin silinir. Mevcut yorumların “Silinen kullanıcı”
                    adıyla anonim kalır. Yalnız e-postan ve silinme tarihi ayrı
                    kayıtta tutulur; aynı adresle yeniden doğrulanmış üyelik
                    oluşturunca bu kayıt kaldırılır. Coinlerin ve açtığın
                    erişimler yeni hesaba aktarılmaz. Bu işlem geri alınamaz.
                  </p>
                  <AccountDeletion />
                </>
              )}
            </section>
          </div>
        </section>
      )}
    </Protected>
  );
}
export function VipPage() {
  const { user } = useSession();
  return (
    <section className="vip-page">
      <PageHeader
        eyebrow="UTRZONE VIP"
        title="Deneyimin bir adım ötesi."
        description="Reklamsız alternatif indirme bağlantılarına eriş, projeye destek ol."
      />
      <div className="vip-intro">
        <Crown size={39} />
        <h2>Daha az bekleme. Daha çok oyun.</h2>
        <p>
          VIP üyelik, mevcut oyunlardaki VIP Pixeldrain bağlantılarına erişim
          sağlar. Standart indirmeler herkese açık kalır.
        </p>
      </div>
      {user?.vip.active && (
        <Notice>
          {user.vip.lifetime
            ? "Hesabında sınırsız VIP etkin."
            : "VIP üyeliğin " +
              new Date(user.vip.expires_at).toLocaleDateString("tr-TR") +
              " tarihine kadar aktif."}
        </Notice>
      )}
      <div className="vip-plans">
        {[
          ["Aylık", "49", "1 ay VIP erişimi"],
          ["Yıllık", "399", "12 ay VIP erişimi · aylığa göre 189 TL avantaj"],
        ].map(([name, price, desc]) => (
          <article className="panel vip-plan" key={name}>
            <span className="eyebrow">
              {name === "Yıllık" ? "UZUN VADELİ DESTEK" : "KEŞFETMEYE BAŞLA"}
            </span>
            <h2>{name} VIP</h2>
            <p className="price">
              {price}
              <span> TL / {name === "Aylık" ? "ay" : "yıl"}</span>
            </p>
            <p className="muted">{desc}</p>
            <ul>
              <li>Reklamsız Pixeldrain / MediaFire alternatifleri</li>
              <li>Günlük giriş ödülünde 2 kat UCoin</li>
              <li>1000 oyunluk favori kütüphanesi</li>
              <li>Favori yamaların yeni sürümleri için isteğe bağlı e-posta</li>
              <li>Erken erişim projelerinde VIP coin fiyatı</li>
              <li>VIP oyun isteklerinde öncelikli değerlendirme</li>
              <li>İsteğin kurucuya e-posta ile bildirilmesi</li>
              <li>VIP tanımlama ve istek durumu bildirimleri</li>
              <li>Hesap ayarlarında üyelik süresi takibi</li>
              <li>Üyeliğin kurucu tarafından etkinleştirilmesi</li>
            </ul>
            <a
              className="primary"
              href="https://www.itemsatis.com/profil/haking06.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              ItemSatış mağazasına git
              <ArrowUpRight size={16} />
            </a>
          </article>
        ))}
      </div>
      <div className="panel">
        <h3>Nasıl etkinleştirilir?</h3>
        <p className="muted">
          Satış ve ödeme ItemSatış üzerinden yürütülür. Mağazadaki güncel ilan
          koşullarını kontrol et; ödeme sonrası UTRZONE hesap e-postanı satıcıya
          ilet. Kurucu üyeliğini elle tanımlar. Bu sitede kart bilgisi alınmaz
          ve otomatik abonelik başlatılmaz. Ücretsiz VIP atamaları da yalnızca
          kurucu tarafından yapılabilir.
        </p>
      </div>
    </section>
  );
}
export function GamePage() {
  const confirm = useConfirm();
  const s = useSession(),
    id = new URLSearchParams(location.search).get("id"),
    [vipLinks, setVipLinks] = useState([]),
    [earlyUnlocked, setEarlyUnlocked] = useState(false),
    [game, setGame] = useState(null),
    [comments, setComments] = useState([]),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!id) {
      setError("Oyun adresi geçersiz.");
      return;
    }
    const c = new AbortController();
    Promise.all([
      api("/games/" + id, { signal: c.signal }),
      api("/games/" + id + "/comments", { signal: c.signal }),
    ])
      .then(([g, cm]) => {
        setGame(g);
        setComments(cm);
        document.title = g.title + " · UTRZONE";
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => c.abort();
  }, [id]);
  useEffect(() => {
    const update = (e) => {
      if (e.detail.gameId === id)
        setGame((g) => (g ? { ...g, download_count: e.detail.count } : g));
    };
    window.addEventListener("utrzone-download", update);
    return () => window.removeEventListener("utrzone-download", update);
  }, [id]);
  async function comment(e) {
    e.preventDefault();
    setBusy(true);
    const form = e.currentTarget;
    try {
      await api("/games/" + id + "/comments", {
        method: "POST",
        token: s.token,
        body: Object.fromEntries(new FormData(form)),
      });
      form.reset();
      setComments(await api("/games/" + id + "/comments"));
      setMessage("Yorumun eklendi.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function moderate(event, item, hide = false) {
    event.preventDefault();
    if (
      hide &&
      !(await confirm({
        title: "Yorumu kalıcı olarak sil?",
        description:
          "Yorum metni veritabanından kaldırılacak. Bu işlem geri alınamaz.",
        confirmLabel: "Yorumu sil",
        danger: true,
      }))
    )
      return;
    setBusy(true);
    try {
      const body = hide
        ? { confirmed: true }
        : {
            body: new FormData(event.currentTarget).get("body"),
            is_deleted: false,
          };
      await api("/admin/comments/" + item.id + (hide ? "/permanent" : ""), {
        token: s.token,
        method: hide ? "DELETE" : "PATCH",
        body,
      });
      setComments(await api("/games/" + id + "/comments"));
      setMessage(hide ? "Yorum silindi." : "Yorum güncellendi.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function vip() {
    setBusy(true);
    try {
      const d = await api("/games/" + id + "/downloads/vip", {
        token: s.token,
      });
      setVipLinks(d.links || [{ label: "Pixeldrain", url: d.url }]);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (error)
    return (
      <div className="empty">
        <h1>Bu oyun açılamadı.</h1>
        <p>{error}</p>
        <a className="secondary" href="/">
          Kütüphaneye dön
        </a>
      </div>
    );
  if (!game)
    return (
      <div className="empty" role="status">
        Oyun yükleniyor…
      </div>
    );
  return (
    <article className="game-page">
      <div className="breadcrumbs">
        <a href="/">Kütüphane</a>
        <span>/</span>
        <span>{game.title}</span>
      </div>
      <PageHeader
        eyebrow={game.engine}
        title={game.title}
        description={
          "Sürüm " +
          game.version +
          " · Son güncelleme " +
          new Date(game.updated_at || game.created_at).toLocaleDateString(
            "tr-TR",
          )
        }
      >
        {s.user?.permissions.manage_games && (
          <a className="secondary" href={"/manage?edit=" + id}>
            <Settings size={15} />
            Bu projeyi düzenle
          </a>
        )}
      </PageHeader>
      <div className="game-social-bar">
        <FavoriteButton gameId={id} count={game.favorite_count || 0} />
        <span>
          <Download size={15} /> {game.download_count || 0} bağlantı açılışı
        </span>
        <span>
          Eklenme: {new Date(game.created_at).toLocaleDateString("tr-TR")}
        </span>
      </div>
      <div className="game-layout">
        <div>
          <GameGallery game={game} />
          <div className="tags">
            <span>{game.engine}</span>
            {game.has_tr_patch && <span className="badge-patch">TR Yama</span>}
            {game.has_mod && <span className="badge-mod">Mod</span>}
            {game.is_adult && <span>18+ / NSFW</span>}
          </div>
          <section className="panel description-panel">
            <h2>Oyun hakkında</h2>
            <p className="description">{game.description}</p>
          </section>
          {game.has_mod && (
            <section className="panel mod-public">
              <h2>Bu paketteki modlar</h2>
              <div className="tags">
                {game.mod_types?.map((t) => (
                  <span key={t} className="badge-mod">
                    {modLabel(t)}
                  </span>
                ))}
              </div>
              {game.mod_notes && (
                <p className="description">{game.mod_notes}</p>
              )}
            </section>
          )}
          {(game.installation_notes || game.compatibility_notes) && (
            <section className="panel">
              <h2>Kurulum ve uyumluluk</h2>
              {game.installation_notes && (
                <p className="description">{game.installation_notes}</p>
              )}
              {game.compatibility_notes && (
                <div className="notice">{game.compatibility_notes}</div>
              )}
            </section>
          )}
        </div>
        <aside className="panel download-panel">
          <h2>
            <Download size={20} />
            İndirme merkezi
          </h2>
          <p className="muted">
            Oyun sürümünü kontrol et. Bağlantılar harici sağlayıcıda açılır.
          </p>
          {game.early_access_active && (
            <EarlyAccess
              game={game}
              onAccess={(url) => {
                setEarlyUnlocked(true);
                setGame((g) => ({ ...g, trlink_url: url }));
              }}
            />
          )}
          {(game.has_standard_download || game.trlink_url) && (
            <DownloadButton
              gameId={id}
              provider="standard"
              label="Standart indirme"
              description="TRLink · Reklamlı"
              onError={setMessage}
            />
          )}
          {game.has_vip_download &&
            (!game.early_access_active || earlyUnlocked) && (
              <div className="vip-download">
                <Crown size={24} />
                <h3>VIP hızlı erişim</h3>
                <p>Pixeldrain / MediaFire · Reklamlı yönlendirme olmadan</p>
                {s.user?.vip.active ? (
                  <button disabled={busy} className="primary" onClick={vip}>
                    Reklamsız bağlantıları göster
                    <ArrowUpRight size={15} />
                  </button>
                ) : (
                  <a className="primary" href="/vip">
                    VIP’yi keşfet
                    <ArrowRightIcon />
                  </a>
                )}
              </div>
            )}
          {vipLinks.map((link) => (
            <DownloadButton
              key={link.label}
              gameId={id}
              provider={
                link.label === "Pixeldrain" ? "pixeldrain" : "mediafire"
              }
              label={link.label}
              description="VIP · Reklamsız alternatif"
              onError={setMessage}
              className="vip-provider"
            />
          ))}
          <small className="muted">
            Dosyaları çalıştırmadan önce güvenlik taraması yap.
          </small>
        </aside>
      </div>
      <section className="panel comments-panel">
        <div className="section-head">
          <h2>
            Topluluk yorumları{" "}
            <span className="muted">({comments.length})</span>
          </h2>
        </div>
        {comments.length === 0 && (
          <p className="muted">Henüz yorum yok. Deneyimini ilk sen paylaş.</p>
        )}
        {comments.map((c) => (
          <article className="comment" key={c.id}>
            <div className="comment-author">
              <span className="avatar">
                {c.display_name.slice(0, 1).toLocaleUpperCase("tr")}
              </span>
              <strong>{c.display_name}</strong>
              <time>{new Date(c.created_at).toLocaleDateString("tr-TR")}</time>
              {c.edited_at && <span className="muted small">Düzenlendi</span>}
            </div>
            <p>{c.body}</p>
            {s.user?.permissions.moderate_comments && (
              <details className="inline-moderation">
                <summary>Yorumu yönet · Yetkili işlem</summary>
                <form onSubmit={(e) => moderate(e, c)}>
                  <Field
                    label="Yorum metni"
                    textarea
                    name="body"
                    defaultValue={c.body}
                    maxLength={2000}
                    required
                    rows={3}
                  />
                  <div className="moderation-actions">
                    <button className="secondary" disabled={busy}>
                      Değişiklikleri kaydet
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      disabled={busy}
                      onClick={(e) => moderate(e, c, true)}
                    >
                      Yorumu sil
                    </button>
                  </div>
                </form>
              </details>
            )}
          </article>
        ))}
        {s.user ? (
          <form onSubmit={comment}>
            <Field
              label="Yorumun"
              textarea
              name="body"
              rows={4}
              maxLength={2000}
              required
            />
            <button disabled={busy} className="primary">
              Yorum paylaş
            </button>
          </form>
        ) : (
          <a
            className="secondary"
            href={"/login?next=" + encodeURIComponent("/game?id=" + id)}
          >
            Yorum yazmak için giriş yap
          </a>
        )}
        <Notice>{message}</Notice>
      </section>
    </article>
  );
}
function ArrowRightIcon() {
  return <ArrowUpRight size={16} />;
}

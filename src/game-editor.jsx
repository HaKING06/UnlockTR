import React, { useEffect, useState } from "react";
import {
  Gamepad2,
  Layers,
  Download,
  ShieldCheck,
  Save,
  Eye,
  Crown,
  FileText,
} from "lucide-react";
import { api, engines } from "./api";
import { useSession } from "./state";
import { Field, Notice } from "./ui";
import { modOptions } from "./game-data";
const empty = {
  title: "",
  description: "",
  version: "1.0",
  cover_image_url: "",
  engine: "Ren'Py",
  is_adult: false,
  has_tr_patch: true,
  has_mod: false,
  mod_types: [],
  mod_notes: "",
  installation_notes: "",
  compatibility_notes: "",
  trlink_url: "",
  pixeldrain_url: "",
  mediafire_url: "",
};
export function GameEditor({ id, onDone, onDirtyChange }) {
  const { token } = useSession(),
    [draft, setDraft] = useState(empty),
    [ready, setReady] = useState(!id),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [attempt, setAttempt] = useState(0),
    [coverFailed, setCoverFailed] = useState(false);
  useEffect(() => {
    onDirtyChange?.(dirty);
    return () => onDirtyChange?.(false);
  }, [dirty, onDirtyChange]);
  const change = (key, value) => {
    setDirty(true);
    if (key === "cover_image_url") setCoverFailed(false);
    setDraft((d) => ({ ...d, [key]: value }));
  };
  useEffect(() => {
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    if (dirty) window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const leave = () => {
    if (
      !busy &&
      (!dirty ||
        window.confirm(
          "Kaydedilmemiş değişikliklerin var. Listene dönmek istiyor musun?",
        ))
    )
      onDone("");
  };

  useEffect(() => {
    if (!id) return;
    setMessage("");
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
  }, [id, token, attempt]);
  function toggleMod(key, checked) {
    setDirty(true);
    setDraft((d) => {
      let types = checked
        ? [...d.mod_types, key]
        : d.mod_types.filter((v) => v !== key);
      if (types.includes("character_names") && !types.includes("incest"))
        types.push("incest");
      return {
        ...d,
        mod_types: [...new Set(types)],
        is_adult: d.is_adult || types.includes("incest"),
      };
    });
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...draft };
      for (const k of ["trlink_url", "pixeldrain_url", "mediafire_url"])
        body[k] = body[k] || null;
      if (body.has_mod && !body.mod_types.length) {
        setMessage("En az bir mod türü seç.");
        return;
      }
      await api("/admin/games" + (id ? "/" + id : ""), {
        method: id ? "PATCH" : "POST",
        token,
        body,
      });
      setDirty(false);
      onDone("Oyun " + (id ? "güncellendi." : "yayınlandı."));
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="game-editor">
      <div className="section-head">
        <div>
          <p className="eyebrow">YAYIN STÜDYOSU</p>
          <h2>{id ? "Projeyi güncelle" : "Yeni bir oyun yayınla"}</h2>
          <p className="muted">
            Oyunu tanıt, yama içeriğini açıkla ve indirme erişimini ayarla.
          </p>
        </div>
        <button className="secondary" disabled={busy} onClick={leave}>
          Listeye dön
        </button>
      </div>
      <Notice>{message}</Notice>
      {!ready && (
        <div className="panel" role="status">
          {message ? (
            <button
              className="secondary"
              onClick={() => setAttempt((a) => a + 1)}
            >
              Yüklemeyi tekrar dene
            </button>
          ) : (
            "Oyun bilgileri yükleniyor…"
          )}
        </div>
      )}
      {ready && (
        <form onSubmit={submit}>
          <div className="editor-layout">
            <div>
              <section className="panel editor-section">
                <h3>
                  <Gamepad2 size={20} />
                  <span>
                    <small>01 · TEMEL BİLGİLER</small>Oyunu tanıtalım
                  </span>
                </h3>
                <div className="form-two">
                  <Field
                    label="Oyunun tam adı *"
                    value={draft.title}
                    maxLength={150}
                    required
                    onChange={(e) => change("title", e.target.value)}
                    placeholder="Örn. oyun adı"
                  />
                  <Field
                    label="Desteklenen sürüm *"
                    value={draft.version}
                    maxLength={40}
                    required
                    onChange={(e) => change("version", e.target.value)}
                  />
                </div>
                <div className="form-two">
                  <label className="field">
                    Oyun motoru
                    <select
                      value={draft.engine}
                      onChange={(e) => change("engine", e.target.value)}
                    >
                      {engines.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                  <Field
                    label="Kapak görseli HTTPS URL *"
                    type="url"
                    value={draft.cover_image_url}
                    maxLength={2048}
                    required
                    onChange={(e) => change("cover_image_url", e.target.value)}
                    placeholder="https://…"
                  />
                </div>
                <Field
                  label="Oyuncuya gösterilecek açıklama *"
                  textarea
                  rows={7}
                  value={draft.description}
                  maxLength={10000}
                  required
                  onChange={(e) => change("description", e.target.value)}
                  placeholder="Oyunun konusu, çevirinin kapsamı ve önemli notlar…"
                />
                <p className="field-help">
                  Görsel dosyası yüklenmez; harici kapak adresi kullanılır.
                  Açıklama düz metindir.
                </p>
              </section>
              <section className="panel editor-section">
                <h3>
                  <Layers size={20} />
                  <span>
                    <small>02 · YAMA İÇERİĞİ</small>Bu pakette neler var?
                  </span>
                </h3>
                <div className="feature-choices">
                  <label>
                    <input
                      type="checkbox"
                      checked={draft.has_tr_patch}
                      onChange={(e) => change("has_tr_patch", e.target.checked)}
                    />
                    <span>
                      <strong>Türkçe yama</strong>
                      <small>Çeviri içeriği mevcut</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={draft.has_mod}
                      onChange={(e) => change("has_mod", e.target.checked)}
                    />
                    <span>
                      <strong>Mod içeriyor</strong>
                      <small>Ek düzenleme veya oyun özelliği</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={draft.is_adult}
                      disabled={
                        draft.mod_types.includes("incest") && draft.has_mod
                      }
                      onChange={(e) => change("is_adult", e.target.checked)}
                    />
                    <span>
                      <strong>18+ / NSFW</strong>
                      <small>Varsayılan kapak uyarısı</small>
                    </span>
                  </label>
                </div>
                {draft.has_mod && (
                  <div className="mod-detail-panel">
                    <h4>Mod türlerini seç</h4>
                    <p className="muted">
                      Birden fazla seçenek kullanabilirsin. İsim/ilişki
                      değişikliği seçimi, isteğin doğrultusunda ensest etiketi
                      ve 18+ uyarısıyla birlikte kaydedilir.
                    </p>
                    <div className="mod-options">
                      {modOptions.map(([key, label, desc]) => (
                        <label key={key}>
                          <input
                            type="checkbox"
                            checked={draft.mod_types.includes(key)}
                            disabled={
                              key === "incest" &&
                              draft.mod_types.includes("character_names")
                            }
                            onChange={(e) => toggleMod(key, e.target.checked)}
                          />
                          <span>
                            <strong>{label}</strong>
                            <small>{desc}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                    <Field
                      label="Mod kapsamı ve özel notlar"
                      textarea
                      rows={4}
                      maxLength={2000}
                      value={draft.mod_notes}
                      onChange={(e) => change("mod_notes", e.target.value)}
                      placeholder="Hangi özellikleri etkiliyor, oyuncunun bilmesi gerekenler neler?"
                    />
                  </div>
                )}
              </section>
              <section className="panel editor-section">
                <h3>
                  <Download size={20} />
                  <span>
                    <small>03 · İNDİRME ERİŞİMİ</small>Standart ve VIP
                    bağlantılar
                  </span>
                </h3>
                <div className="download-rule">
                  <ShieldCheck size={18} />
                  <p>
                    Standart üyeler yalnızca reklamlı TRLink bağlantısını görür.
                    Pixeldrain ve MediaFire reklamsız alternatifleri aktif VIP
                    kontrolünden sonra açılır.
                  </p>
                </div>
                <Field
                  label="Standart indirme · TRLink / reklamlı HTTPS URL *"
                  type="url"
                  value={draft.trlink_url}
                  maxLength={2048}
                  required
                  onChange={(e) => change("trlink_url", e.target.value)}
                  placeholder="https://…"
                />
                <div className="vip-editor-links">
                  <span className="vip-badge">
                    <Crown size={13} />
                    Yalnız VIP
                  </span>
                  <Field
                    label="Pixeldrain · Reklamsız VIP URL"
                    type="url"
                    value={draft.pixeldrain_url}
                    maxLength={2048}
                    onChange={(e) => change("pixeldrain_url", e.target.value)}
                  />
                  <Field
                    label="MediaFire · Reklamsız VIP alternatif URL"
                    type="url"
                    value={draft.mediafire_url}
                    maxLength={2048}
                    onChange={(e) => change("mediafire_url", e.target.value)}
                  />
                  <small>
                    Bir veya iki VIP sağlayıcısı ekleyebilirsin. Bu bağlantılar
                    herkese açık katalogda döndürülmez.
                  </small>
                </div>
              </section>
              <section className="panel editor-section">
                <h3>
                  <FileText size={20} />
                  <span>
                    <small>04 · KURULUM REHBERİ</small>Oyuncuya yol göster
                  </span>
                </h3>
                <Field
                  label="Kurulum adımları"
                  textarea
                  rows={6}
                  maxLength={4000}
                  value={draft.installation_notes}
                  onChange={(e) => change("installation_notes", e.target.value)}
                  placeholder="1. Dosyalarını yedekle…"
                />
                <Field
                  label="Uyumluluk ve önemli uyarılar"
                  textarea
                  rows={3}
                  maxLength={1000}
                  value={draft.compatibility_notes}
                  onChange={(e) =>
                    change("compatibility_notes", e.target.value)
                  }
                  placeholder="Desteklenen işletim sistemi, mağaza sürümü veya mevcut kayıt notları…"
                />
              </section>
            </div>
            <aside className="panel editor-summary">
              <span className="eyebrow">YAYIN ÖZETİ</span>
              {draft.cover_image_url.startsWith("https://") && !coverFailed && (
                <img
                  className={
                    "editor-cover-preview" +
                    (draft.is_adult ? " restricted" : "")
                  }
                  src={draft.cover_image_url}
                  alt="Kapak önizlemesi"
                  referrerPolicy="no-referrer"
                  onError={() => setCoverFailed(true)}
                />
              )}
              {coverFailed && (
                <p className="notice">
                  Kapak yüklenemedi. Görsel adresini kontrol et.
                </p>
              )}
              <h3>{draft.title || "Yeni oyun"}</h3>
              <div className="editor-checklist">
                <strong>Yayın kontrol listesi</strong>
                {[
                  ["Oyun adı", draft.title.trim()],
                  ["Açıklama", draft.description.trim()],
                  ["HTTPS kapak", draft.cover_image_url.startsWith("https://")],
                  ["Reklamlı indirme", draft.trlink_url.startsWith("https://")],
                  ["Mod türleri", !draft.has_mod || draft.mod_types.length],
                ].map(([label, ok]) => (
                  <p key={label} className={ok ? "" : "incomplete"}>
                    {ok ? "✓" : "○"} {label}
                  </p>
                ))}
              </div>
              <p>
                {draft.engine} · v{draft.version || "—"}
              </p>
              <ul>
                <li>
                  {draft.has_tr_patch
                    ? "Türkçe yama eklendi"
                    : "Türkçe yama seçilmedi"}
                </li>
                <li>
                  {draft.has_mod
                    ? draft.mod_types.length + " mod türü"
                    : "Mod seçilmedi"}
                </li>
                <li>
                  {draft.is_adult ? "18+ kapak koruması açık" : "Genel içerik"}
                </li>
                <li>
                  {draft.trlink_url
                    ? "Standart bağlantı hazır"
                    : "Standart bağlantı gerekli"}
                </li>
                <li>
                  {
                    [draft.pixeldrain_url, draft.mediafire_url].filter(Boolean)
                      .length
                  }{" "}
                  VIP sağlayıcısı
                </li>
              </ul>
              <button className="primary" disabled={busy}>
                <Save size={16} />
                {busy
                  ? "Kaydediliyor…"
                  : id
                    ? "Değişiklikleri kaydet"
                    : "Oyunu yayınla"}
              </button>
              <small>
                * işaretli alanlar zorunludur. Yayın öncesinde bağlantıları ve
                paket sürümünü kontrol et.
              </small>
            </aside>
          </div>
        </form>
      )}
    </section>
  );
}

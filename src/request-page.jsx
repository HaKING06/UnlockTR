import React, { useEffect, useState } from "react";
import { Crown, Plus, Clock3 } from "lucide-react";
import { api } from "./api";
import { useSession } from "./state";
import { Field, Notice, PageHeader, Protected } from "./ui";
export const statuses = {
  pending: "Bekliyor",
  reviewing: "İnceleniyor",
  preparing: "Hazırlık aşamasında",
  completed: "Tamamlandı",
  declined: "Şimdilik uygun değil",
};
export function RequestPage() {
  const s = useSession(),
    [rows, setRows] = useState([]),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [tick, setTick] = useState(0);
  useEffect(() => {
    if (!s.user) return;
    const c = new AbortController();
    api("/requests", { token: s.token, signal: c.signal })
      .then(setRows)
      .catch((e) => {
        if (e.name !== "AbortError") setMessage(e.message);
      });
    return () => c.abort();
  }, [s.token, !!s.user, tick]);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const f = e.currentTarget,
      b = Object.fromEntries(new FormData(f));
    b.game_url = b.game_url || null;
    try {
      const d = await api("/requests", {
        token: s.token,
        method: "POST",
        body: b,
      });
      setMessage(d.message);
      f.reset();
      setTick((t) => t + 1);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Protected user={s.user} loading={s.loading}>
      <section className="requests-page">
        <PageHeader
          eyebrow="SIRADAKİ OYUNU SEN SEÇ"
          title="İsteğin bir hikâyeye dönüşsün."
          description="Oyunun adını, sürümünü ve istediğin çalışmayı anlat. Durumunu buradan takip et."
        />
        <div className="request-priority">
          <Crown size={23} />
          <div>
            <strong>
              {s.user?.vip.active
                ? "VIP önceliğin aktif"
                : "VIP ile öncelikli değerlendirme"}
            </strong>
            <p>
              VIP istekleri öncelikli sıraya alınır ve kurucuya e-posta ile
              bildirilir. Bu, belirli bir teslim tarihi veya tamamlanma
              garantisi değildir.
            </p>
          </div>
          {!s.user?.vip.active && (
            <a className="secondary" href="/vip">
              VIP’yi keşfet
            </a>
          )}
        </div>
        <Notice>{message}</Notice>
        <div className="request-layout">
          <section className="panel">
            <h2>Yeni oyun isteği</h2>
            <form onSubmit={submit}>
              <Field
                label="Oyunun tam adı"
                name="title"
                maxLength={150}
                required
                placeholder="Oyun adı ve varsa sürümü"
              />
              <div className="form-two">
                <label className="field">
                  İstek türü
                  <select name="request_type">
                    <option value="translation">Türkçe yama</option>
                    <option value="mod">Mod çalışması</option>
                    <option value="update">Mevcut yama güncellemesi</option>
                  </select>
                </label>
                <label className="field">
                  Platform
                  <select name="platform">
                    <option>PC</option>
                    <option>Android</option>
                    <option>PC + Android</option>
                  </select>
                </label>
              </div>
              <Field
                label="Resmî oyun / mağaza bağlantısı (isteğe bağlı)"
                name="game_url"
                type="url"
                placeholder="https://…"
                maxLength={2048}
              />
              <Field
                label="İsteğin ve sürüm bilgisi"
                textarea
                rows={5}
                name="description"
                maxLength={2000}
                required
                placeholder="Hangi sürüm için hangi çeviri veya modu istiyorsun?"
              />
              <button className="primary" disabled={busy}>
                <Plus size={16} />
                {busy ? "Gönderiliyor…" : "İsteği değerlendirmeye gönder"}
              </button>
            </form>
          </section>
          <section className="panel request-history">
            <h2>İstek geçmişin</h2>
            {!rows.length && <p className="muted">Henüz bir isteğin yok.</p>}
            {rows.map((r) => (
              <article key={r.id} className="request-card">
                <div>
                  <h3>{r.title}</h3>
                  <span className={"status-tag status-" + r.status}>
                    {statuses[r.status]}
                  </span>
                </div>
                {r.vip_priority && (
                  <span className="vip-badge">
                    <Crown size={12} />
                    VIP öncelikli
                  </span>
                )}
                <p className="muted">{r.description}</p>
                <small>
                  {r.platform} ·{" "}
                  {new Date(r.created_at).toLocaleDateString("tr-TR")}
                </small>
                {r.admin_reply && (
                  <div className="request-reply">
                    <strong>Ekip yanıtı</strong>
                    <p>{r.admin_reply}</p>
                  </div>
                )}
              </article>
            ))}
          </section>
        </div>
      </section>
    </Protected>
  );
}
export function RequestReview({ request, busy, onSave }) {
  const [status, setStatus] = useState(request.status),
    [reply, setReply] = useState(request.admin_reply || "");
  const defaults = {
    pending:
      "İsteğin sıraya alındı. Ekip kapasitesine göre tekrar ele alınacak; durum değiştiğinde seni bilgilendireceğiz.",
    reviewing:
      "İsteğini inceliyoruz. Oyun sürümünü, teknik uygunluğunu ve çalışma kapsamını değerlendiriyoruz. Henüz yayın tarihi veya çalışma onayı verilmedi.",
    preparing:
      "İsteğin uygun bulundu ve hazırlık aşamasına alındı. Gerekli dosyalar ve çalışma planı hazırlanıyor.",
    completed:
      "Çalışma tamamlandı. Güncel içerikleri oyun kütüphanemizde inceleyebilirsin.",
    declined:
      "Şu an bu oyun için uygun bir çalışma takvimi oluşturamıyoruz. İleride tekrar istekte bulunabilirsin.",
  };
  const presets = [
    ["Sırada · Ekip kapasitesi bekleniyor", "pending", defaults.pending],
    ["İnceleme · Sürüm ve uygunluk kontrolü", "reviewing", defaults.reviewing],
    [
      "İnceleme · Ek bilgi gerekli",
      "reviewing",
      "Tam oyun adı, sürüm ve resmî oyun bağlantısıyla destek sayfamızdan bize ulaşabilirsin.",
    ],
    ["Hazırlık · Çalışma planlanıyor", "preparing", defaults.preparing],
    ["Tamamlandı · Kütüphaneyi kontrol et", "completed", defaults.completed],
    ["Uygun değil · Zaman ayıramıyoruz", "declined", defaults.declined],
    [
      "Uygun değil · Oyun elimizde yok",
      "declined",
      "Oyunun kullanılabilir kopyası elimizde yok. Uygun sürüme eriştiğimizde tekrar değerlendirebiliriz.",
    ],
    [
      "Uygun değil · Teknik uyumsuzluk",
      "declined",
      "Mevcut sürümde teknik uyumluluk sorunu var. Uygun araç veya sürüm bulunduğunda yeniden değerlendirebiliriz.",
    ],
  ];
  return (
    <form
      className="comment request-review"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ status, reply });
      }}
    >
      <div className="section-head">
        <strong>
          {request.title} · {request.display_name}
        </strong>
        {request.vip_priority && (
          <span className="vip-badge">
            <Crown size={12} />
            VIP öncelikli
          </span>
        )}
      </div>
      <p>{request.description}</p>
      <small className="muted">
        {request.platform} · {request.request_type}
      </small>
      <div className="form-two">
        <label className="field">
          İstek durumu
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setReply(defaults[e.target.value]);
            }}
          >
            {Object.entries(statuses).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Hazır yanıt
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value !== "") {
                const preset = presets[Number(e.target.value)];
                setReply(preset[2]);
                setStatus(preset[1]);
              }
              e.target.value = "";
            }}
          >
            <option value="">Bir şablon seç</option>
            {presets.map(([label], index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Field
        label="Kullanıcıya gönderilecek yanıt (boşsa duruma uygun varsayılan kullanılır)"
        textarea
        rows={4}
        maxLength={2000}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
      />
      <div className="request-reply">
        <strong>E-posta önizlemesi · {statuses[status]}</strong>
        <p>{reply || defaults[status]}</p>
        <small>Kaydedildiğinde üyeye durum bildirimi gönderilir.</small>
      </div>
      <button className="secondary" disabled={busy}>
        Durumu kaydet ve bildir
      </button>
    </form>
  );
}

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
  const presets = {
    no_time:
      "Şu an bu oyun için uygun bir çalışma takvimi oluşturamıyoruz. İleride tekrar istekte bulunabilirsin.",
    no_copy:
      "Oyunun kullanılabilir bir kopyası elimizde yok. Uygun bir sürüme eriştiğimizde tekrar değerlendirebiliriz.",
    technical:
      "Mevcut sürümde teknik uyumluluk sorunu var. Uygun bir araç veya sürüm bulunduğunda tekrar değerlendirebiliriz.",
    preparing:
      "Güzel haber! İsteğin için hazırlık aşamasına geçtik. Hazır olduğunda paylaşacağız.",
  };
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
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
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
              if (e.target.value) {
                setReply(presets[e.target.value]);
                setStatus(
                  e.target.value === "preparing" ? "preparing" : "declined",
                );
              }
            }}
          >
            <option value="">Bir şablon seç</option>
            <option value="no_time">Şu an zaman ayıramıyoruz</option>
            <option value="no_copy">Oyun elimizde yok</option>
            <option value="technical">Teknik uyumsuzluk</option>
            <option value="preparing">Olumlu · Hazırlık aşamasında</option>
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
      <button className="secondary" disabled={busy}>
        Durumu kaydet ve bildir
      </button>
    </form>
  );
}

import React, { useState } from "react";
import { Mail, Send, ShieldCheck } from "lucide-react";
import { useSession } from "./state";
import { api } from "./api";
import { Field, Notice, PageHeader, Protected } from "./ui";
export function MailPage() {
  const s = useSession();
  const [to, setTo] = useState(""),
    [subject, setSubject] = useState(""),
    [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [confirm, setConfirm] = useState(false),
    [draftId, setDraftId] = useState(() => crypto.randomUUID());
  async function send(e) {
    e.preventDefault();
    if (!confirm || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const d = await api("/admin/mail", {
        token: s.token,
        method: "POST",
        body: { to, subject, text, draft_id: draftId },
      });
      setMessage(d.message);
      setConfirm(false);
      setDraftId(crypto.randomUUID());
      setTo("");
      setSubject("");
      setText("");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Protected user={s.user} loading={s.loading}>
      {s.user &&
        (s.user.permissions.manage_games ? (
          <section className="mail-page">
            <PageHeader
              eyebrow="KURUMSAL İLETİŞİM"
              title="UnlockTR posta stüdyosu."
              description="Destek yanıtlarını ve kişisel bilgilendirmeleri marka kimliğimizle gönder."
            />
            <a className="back-link" href="/manage">
              Yönetim merkezine dön
            </a>
            <div className="mail-layout">
              <section className="panel">
                <h2>
                  <Mail size={20} /> Yeni e-posta
                </h2>
                <p className="muted small">
                  Gönderen: UnlockTR &lt;unlocktr@haking.tr&gt; · Yanıtlar
                  destek adresine gelir.
                </p>
                <form onSubmit={send}>
                  <Field
                    label="Alıcı e-posta adresi"
                    type="email"
                    value={to}
                    onChange={(e) => {
                      setTo(e.target.value);
                      setConfirm(false);
                      setDraftId(crypto.randomUUID());
                    }}
                    maxLength={254}
                    required
                  />
                  <Field
                    label="Konu"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setConfirm(false);
                      setDraftId(crypto.randomUUID());
                    }}
                    maxLength={150}
                    required
                  />
                  <Field
                    label="Mesaj"
                    textarea
                    rows={10}
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setConfirm(false);
                      setDraftId(crypto.randomUUID());
                    }}
                    minLength={10}
                    maxLength={10000}
                    required
                  />
                  <label className="switch-row">
                    <span>
                      Alıcıyı ve mesajı kontrol ettim; gönderimi onaylıyorum.
                    </span>
                    <input
                      type="checkbox"
                      checked={confirm}
                      onChange={(e) => setConfirm(e.target.checked)}
                      required
                    />
                  </label>
                  <button className="primary" disabled={busy || !confirm}>
                    <Send size={16} />
                    {busy ? "Kuyruğa ekleniyor…" : "E-postayı gönder"}
                  </button>
                  <Notice>{message}</Notice>
                </form>
              </section>
              <aside>
                <div className="mail-preview">
                  <img src="/brand/horizontal.svg" alt="UnlockTR" />
                  <small> E-POSTA ÖNİZLEMESİ</small>
                  <h2>{subject || "Mesajının konusu"}</h2>
                  <p>
                    {text ||
                      "Mesajın burada görünecek. Sade, anlaşılır ve kişisel bir iletişim kur."}
                  </p>
                  <hr />
                  <small>UnlockTR Ekibi · unlocktr@haking.tr</small>
                </div>
                <p className="muted small">
                  <ShieldCheck size={13} /> Yalnızca kurucu ve yardımcı
                  kurucular. Gönderimler işlem kaydına alınır. Bu alan toplu
                  pazarlama için tasarlanmamıştır.
                </p>
              </aside>
            </div>
          </section>
        ) : (
          <section className="empty">
            <h1>Bu alan ekip iletişimine özel.</h1>
            <a href="/account">Hesabımı aç</a>
          </section>
        ))}
    </Protected>
  );
}

import React, { useState } from "react";
import {
  Mail,
  Send,
  ShieldCheck,
  UserRound,
  Users,
  Shield,
} from "lucide-react";
import { useSession } from "./state";
import { useConfirm } from "./confirm-dialog";
import { api } from "./api";
import { Field, Notice, PageHeader, Protected } from "./ui";
const audiences = [
  ["single", "Tek alıcı", "Özel bir adrese yanıt gönder.", UserRound],
  ["moderators", "Moderatörler", "Duyuruları açık moderatör ekibi.", Shield],
  ["all", "Tüm üyeler", "Duyuruları açık doğrulanmış üyeler.", Users],
];
export function MailPage() {
  const s = useSession(),
    confirm = useConfirm(),
    [to, setTo] = useState(""),
    [audience, setAudience] = useState("single"),
    [subject, setSubject] = useState(""),
    [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [draftId, setDraftId] = useState(() => crypto.randomUUID());
  function change(setter, value) {
    setter(value);
    setDraftId(crypto.randomUUID());
  }
  async function send(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const preview = await api("/admin/mail/preview", {
        token: s.token,
        method: "POST",
        body: { audience, ...(audience === "single" ? { to } : {}) },
      });
      if (!preview.count) {
        setMessage("Bu seçimde uygun alıcı yok.");
        return;
      }
      if (
        !(await confirm({
          title: "Gönderimi son kez kontrol et",
          description: subject,
          detail:
            preview.count +
            " alıcı · " +
            audiences.find((x) => x[0] === audience)[1] +
            (audience === "single" ? " · " + to : ""),
          acknowledgement:
            "Alıcı grubunu ve mesaj içeriğini kontrol ettim; gönderimi onaylıyorum.",
          confirmLabel: preview.count + " kişiye gönder",
        }))
      )
        return;
      const d = await api("/admin/mail", {
        token: s.token,
        method: "POST",
        body: {
          audience,
          ...(audience === "single" ? { to } : {}),
          subject,
          text,
          draft_id: draftId,
          confirm_count: preview.count,
          recipient_hash: preview.recipient_hash,
          confirmed: true,
        },
      });
      setMessage(d.message);
      setDraftId(crypto.randomUUID());
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
              eyebrow="EKİP · POSTA STÜDYOSU"
              title="Doğru mesaj. Doğru topluluk."
              description="Tek kişiye yanıt ver veya üyelerine platform duyurusu gönder. Alıcıları gönderimden önce tekrar doğruluyoruz."
            />
            <a className="back-link" href="/manage">
              Yönetim merkezine dön
            </a>
            <div className="mail-layout">
              <section className="panel">
                <form onSubmit={send}>
                  <fieldset className="audience-options">
                    <legend>Alıcı grubu</legend>
                    {audiences.map(([value, label, desc, Icon]) => (
                      <label
                        key={value}
                        className={audience === value ? "selected" : ""}
                      >
                        <input
                          type="radio"
                          name="audience"
                          value={value}
                          checked={audience === value}
                          onChange={() => change(setAudience, value)}
                        />
                        <Icon size={19} />
                        <span>
                          <strong>{label}</strong>
                          <small>{desc}</small>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  {audience === "single" && (
                    <Field
                      label="Alıcı e-posta adresi"
                      type="email"
                      maxLength={254}
                      required
                      value={to}
                      onChange={(e) => change(setTo, e.target.value)}
                    />
                  )}
                  <Field
                    label="Konu"
                    maxLength={150}
                    required
                    value={subject}
                    onChange={(e) => change(setSubject, e.target.value)}
                  />
                  <Field
                    label="Mesaj"
                    textarea
                    rows={10}
                    minLength={10}
                    maxLength={10000}
                    required
                    value={text}
                    onChange={(e) => change(setText, e.target.value)}
                  />
                  <button className="primary" disabled={busy}>
                    <Send size={16} />
                    {busy
                      ? "Kontrol ediliyor…"
                      : "Alıcıları kontrol et ve önizle"}
                  </button>
                  <Notice>{message}</Notice>
                </form>
              </section>
              <aside>
                <div className="mail-preview">
                  <div className="mail-preview-top">
                    <img src="/brand/horizontal.webp?v=0.9.0" alt="UTRZONE" />
                    <span>ÖNİZLEME</span>
                  </div>
                  <small>
                    {audiences.find((x) => x[0] === audience)[1]} ·
                    utrzone@haking.tr
                  </small>
                  <h2>{subject || "Mesajının konusu"}</h2>
                  <p>
                    {text ||
                      "Sade, anlaşılır ve faydalı bir mesaj yaz. Duyurunun kim için olduğunu ilk cümlede belirt."}
                  </p>
                  <hr />
                  <small>UTRZONE Ekibi · Yanıtlar destek adresine gelir.</small>
                </div>
                <p className="muted small">
                  <ShieldCheck size={13} /> Yalnız kurucu ve yardımcı kurucular.
                  Grup gönderimleri üyelerin duyuru tercihini dikkate alır. Her
                  alıcıya ayrı e-posta gider; adresler diğer üyelerle
                  paylaşılmaz. Gerçek teslim e-posta kuyruğundan izlenir.
                </p>
              </aside>
            </div>
          </section>
        ) : (
          <div className="empty">
            <h1>Bu alan ekip iletişimine özel.</h1>
          </div>
        ))}
    </Protected>
  );
}

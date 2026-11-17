import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "./api";
import { useSession } from "./state";
import { Field, Notice } from "./ui";
export function GameDelete({ id, title, onDeleted }) {
  const { token } = useSession(),
    [confirm, setConfirm] = useState(""),
    [password, setPassword] = useState(""),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function remove(e) {
    e.preventDefault();
    if (confirm !== title) return;
    setBusy(true);
    try {
      const d = await api("/admin/games/" + id, {
        token,
        method: "DELETE",
        body: { confirmation: confirm, password },
      });
      window.dispatchEvent(new Event("unlocktr-coins"));
      onDeleted(d.message);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
      setPassword("");
    }
  }
  return (
    <section className="panel danger-zone game-delete">
      <h3>
        <Trash2 size={18} /> Projeyi sil
      </h3>
      <p className="muted">
        Oyun ve yorumları kalıcı olarak silinir. Satın alımı olan projelerde
        mevcut erişimleri korumak için silme kapalıdır; otomatik coin iadesi
        yapılmaz. Bu işlem geri alınamaz.
      </p>
      {!open ? (
        <button
          className="danger-button"
          type="button"
          onClick={() => setOpen(true)}
        >
          Bu projeyi sil
        </button>
      ) : (
        <form onSubmit={remove}>
          <p>
            Devam etmek için <strong>{title}</strong> adını birebir yaz ve kendi
            hesap şifrenle onayla.
          </p>
          <Field
            label="Silinecek projenin adını yaz"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="off"
            required
          />
          <Field
            label="Kendi hesap şifren"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className="danger-button"
            disabled={busy || confirm !== title || !password}
          >
            Projeyi kalıcı olarak sil
          </button>
          <button
            type="button"
            className="text-button"
            disabled={busy}
            onClick={() => {
              setOpen(false);
              setPassword("");
              setConfirm("");
            }}
          >
            Vazgeç
          </button>
          <Notice>{message}</Notice>
        </form>
      )}
    </section>
  );
}

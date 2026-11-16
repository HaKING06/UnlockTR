import React, { useEffect, useRef, useState } from "react";
import { Gamepad2, X, Plus, Eye, EyeOff } from "lucide-react";
import { api } from "./api";
import { useSession } from "./state";
import { Field } from "./ui";
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
export function Cover({ game }) {
  const { nsfw: reveal, showNsfw } = useSession();
  const onReveal = () => showNsfw(true);
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

import React, { useState } from "react";
import { api } from "./api";
import { useSession } from "./state";
import { Field, Notice } from "./ui";
import { CodeInput } from "./otp-input";
export function AccountDeletion() {
  const s = useSession(),
    [password, setPassword] = useState(""),
    [stage, setStage] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function send() {
    setBusy(true);
    try {
      const d = await api("/me/delete-code", {
        token: s.token,
        method: "POST",
        body: { password },
      });
      setMessage(d.message);
      setStage(true);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/me", {
        token: s.token,
        method: "DELETE",
        body: {
          password,
          code: new FormData(e.currentTarget).get("code"),
          confirmation: new FormData(e.currentTarget).get("confirmation"),
        },
      });
      s.setSession(null);
      location.href = "/login";
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <Field
        label="Şifren"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />
      <button
        className="secondary"
        type="button"
        onClick={send}
        disabled={busy || !password}
      >
        {stage ? "Silme kodunu yeniden gönder" : "E-posta onay kodu gönder"}
      </button>
      <Notice>{message}</Notice>
      {stage && (
        <form onSubmit={remove}>
          <CodeInput label="Hesap silme kodu" />
          <Field
            label="Onaylamak için SİL yaz"
            name="confirmation"
            pattern="SİL"
            required
          />
          <button className="danger-button" disabled={busy}>
            Kodu doğrula ve hesabımı sil
          </button>
        </form>
      )}
    </div>
  );
}

import { CodeInput } from "./otp-input";
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Gamepad2,
  Mail,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { api } from "./api";
import { useSession, nextPath } from "./state";
import { Field, Notice } from "./ui";
export function AuthPage({ mode = "login" }) {
  const { setSession } = useSession();
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [reset, setReset] = useState(false);
  const register = mode === "register",
    forgot = mode === "forgot";
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const path = register
        ? "/auth/register"
        : forgot
          ? reset
            ? "/auth/reset-password"
            : "/auth/forgot-password"
          : "/auth/login";
      const d = await api(path, { method: "POST", body });
      if (register) {
        sessionStorage.setItem("unlocktr-pending-email", body.email);
        location.href = "/verify?next=" + encodeURIComponent(nextPath());
      } else if (!forgot) {
        setSession(d);
        location.href = nextPath();
      } else {
        setMessage(d.message);
        if (!reset) setReset(true);
      }
    } catch (e) {
      setMessage(e.message);
      if (e.code === "EMAIL_UNVERIFIED") {
        sessionStorage.setItem("unlocktr-pending-email", body.email);
        setMessage(
          "E-postanı doğrulamalısın. Doğrulama sayfasından yeni kod isteyebilirsin.",
        );
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-layout">
      <aside className="auth-story">
        <div>
          <Gamepad2 size={40} />
          <p className="eyebrow">OYUNUN SINIRLARINI KALDIR</p>
          <h2>
            Bir hesap.
            <br />
            Binlerce yeni hikâye.
          </h2>
          <p>
            Oyunları keşfet, yorumlarını paylaş ve sıradaki Türkçe yamaya sen
            yön ver.
          </p>
          <span>
            <ShieldCheck size={15} />
            E-posta doğrulamalı güvenli üyelik
          </span>
        </div>
      </aside>
      <div className="auth-sheet">
        <span className="eyebrow">TOPLULUĞA KATIL</span>
        <h1>
          {register
            ? "Yeni bir başlangıç."
            : forgot
              ? "Hesabına geri dön."
              : "Tekrar hoş geldin."}
        </h1>
        <p className="muted">
          {register
            ? "Gmail adresinle UnlockTR hesabını oluştur."
            : forgot
              ? "E-postana gönderilen kodla şifreni yenile."
              : "Kaldığın yerden devam etmek için giriş yap."}
        </p>
        <nav className="auth-tabs">
          <a className={!register && !forgot ? "active" : ""} href="/login">
            Giriş yap
          </a>
          <a className={register ? "active" : ""} href="/register">
            Hesap oluştur
          </a>
        </nav>
        <form onSubmit={submit}>
          {register && (
            <Field
              label="Görünen ad"
              name="display_name"
              minLength={2}
              maxLength={40}
              autoComplete="nickname"
              required
            />
          )}
          <Field
            label="E-posta adresin"
            type="email"
            name="email"
            maxLength={254}
            autoComplete="email"
            pattern={register ? "[^@]+@gmail[.]com" : undefined}
            required
          />
          {(!forgot || reset) && (
            <Field
              label={forgot ? "Yeni şifre" : "Şifre"}
              type="password"
              name="password"
              minLength={12}
              maxLength={72}
              autoComplete={
                register || forgot ? "new-password" : "current-password"
              }
              required
            />
          )}
          {forgot && reset && <CodeInput label="E-postadaki 6 haneli kod" />}
          {register && (
            <p className="muted small">
              Şifren en az 12 karakter olmalı. Kayıt sonrası e-postana gelen
              kodu girerek hesabını açacaksın.
            </p>
          )}
          <button className="primary" disabled={busy}>
            {busy
              ? "İşleniyor…"
              : register
                ? "Hesap oluştur"
                : forgot
                  ? reset
                    ? "Şifreyi yenile"
                    : "Sıfırlama kodu gönder"
                  : "Giriş yap"}
            <ArrowRight size={16} />
          </button>
          <Notice>{message}</Notice>
        </form>
        <div className="auth-links">
          <a href="/forgot-password">Şifremi unuttum</a>
          <a href="/verify">E-postamı doğrula</a>
        </div>
      </div>
    </section>
  );
}
export function VerifyPage() {
  const { setSession } = useSession();
  const [email, setEmail] = useState(() => {
      try {
        return sessionStorage.getItem("unlocktr-pending-email") || "";
      } catch {
        return "";
      }
    }),
    [token] = useState(() => new URLSearchParams(location.search).get("token")),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    const u = new URL(location.href);
    u.searchParams.delete("token");
    history.replaceState({}, "", u.pathname + u.search);
  }, []);
  useEffect(() => {
    if (!cooldown) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const d = await api(token ? "/auth/verify" : "/auth/verify-code", {
        method: "POST",
        body: token
          ? { token }
          : { email, code: new FormData(e.currentTarget).get("code") },
      });
      setSession(d);
      sessionStorage.removeItem("unlocktr-pending-email");
      location.href = nextPath();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    if (!email) {
      setMessage("Önce e-posta adresini gir.");
      return;
    }
    setBusy(true);
    try {
      const d = await api("/auth/resend", { method: "POST", body: { email } });
      setMessage(d.message);
      setCooldown(60);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel narrow verify-page">
      <div className="auth-emblem">
        <Mail size={28} />
      </div>
      <p className="eyebrow">SON BİR ADIM</p>
      <h1>E-postanı doğrula.</h1>
      <p className="muted">
        {token
          ? "Eski doğrulama bağlantını onaylayarak devam edebilirsin."
          : "Gelen kutuna gönderdiğimiz 6 haneli kodu gir. Doğrulama tamamlanınca otomatik giriş yapacaksın."}
      </p>
      <form onSubmit={submit}>
        {!token && (
          <>
            <Field
              label="E-posta"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <CodeInput label="Doğrulama kodu" />
          </>
        )}
        <button className="primary" disabled={busy}>
          Doğrula ve giriş yap
          <ArrowRight size={16} />
        </button>
      </form>
      {!token && (
        <button
          className="text-button"
          disabled={busy || cooldown > 0}
          onClick={resend}
        >
          {cooldown
            ? cooldown + " saniye sonra tekrar gönder"
            : "Kod gelmedi · Yeniden gönder"}
        </button>
      )}
      <Notice>{message}</Notice>
      <a className="back-link" href="/login">
        Giriş sayfasına dön
      </a>
    </section>
  );
}

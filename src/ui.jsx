import React from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
export function Field({ label, textarea = false, ...props }) {
  return (
    <label className="field">
      {label}
      {textarea ? <textarea {...props} /> : <input {...props} />}
    </label>
  );
}
export function PageHeader({
  eyebrow = "UNLOCKTR",
  title,
  description,
  children,
}) {
  return (
    <div className="section-head page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function Notice({ children }) {
  return children ? (
    <p className="notice" role="status">
      {children}
    </p>
  ) : null;
}
export function Protected({ user, loading, children }) {
  if (loading)
    return (
      <div className="empty" role="status">
        Hesabın yükleniyor…
      </div>
    );
  if (!user)
    return (
      <section className="panel narrow">
        <ShieldCheck size={36} />
        <h1>Oturum açman gerekiyor</h1>
        <p className="muted">Hesabına giriş yaparak devam et.</p>
        <a
          className="primary"
          href={
            "/login?next=" +
            encodeURIComponent(location.pathname + location.search)
          }
        >
          Giriş yap
        </a>
      </section>
    );
  return children;
}

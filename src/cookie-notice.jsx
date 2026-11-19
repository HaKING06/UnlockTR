import React, { useState, useEffect } from "react";
import { Cookie } from "lucide-react";
import { readConsent, saveConsent } from "./consent";
export function CookieNotice() {
  const [consent, setConsent] = useState(readConsent),
    [open, setOpen] = useState(false),
    [preferences, setPreferences] = useState(
      () => readConsent()?.preferences ?? false,
    );
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("utrzone-cookie-settings", show);
    return () => window.removeEventListener("utrzone-cookie-settings", show);
  }, []);
  function save(value) {
    setConsent(saveConsent(value));
    setPreferences(value);
    setOpen(false);
  }
  if (consent && !open) return null;
  return (
    <section className="cookie-notice" aria-label="Çerez tercihleri">
      <span className="cookie-symbol">
        <Cookie size={23} />
      </span>
      <div>
        <strong>Deneyim senin kontrolünde.</strong>
        <p>
          Güvenli oturum ve tercihlerini hatırlamak için tarayıcı depolaması
          kullanıyoruz. Analitik veya reklam takipçisi çalıştırmıyoruz.{" "}
          <a href="/privacy">Depolama politikasını incele</a>
        </p>
        {open && (
          <div className="cookie-options">
            <label>
              <input type="checkbox" checked disabled />
              Oturum ve güvenlik · gerekli
            </label>
            <label>
              <input
                type="checkbox"
                checked={preferences}
                onChange={(e) => setPreferences(e.target.checked)}
              />
              Görünüm tercihlerini cihazda hatırla
            </label>
            <small>
              Hesabında seçtiğin ayarlar sunucuda korunur. İsteğe bağlı cihaz
              tercihleri izninle saklanır.
            </small>
          </div>
        )}
      </div>
      <div className="cookie-actions">
        <button
          className="primary"
          onClick={() => save(open ? preferences : true)}
        >
          {open ? "Seçimlerimi kaydet" : "Kabul et"}
        </button>
        <button className="secondary" onClick={() => save(false)}>
          Sadece gerekli
        </button>
        {!open && (
          <button className="text-button" onClick={() => setOpen(true)}>
            Tercihler
          </button>
        )}
      </div>
    </section>
  );
}

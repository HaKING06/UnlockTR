import React, { useEffect, useState } from "react";
import { Cookie, Coffee, ArrowUpRight, ShieldCheck, Crown } from "lucide-react";
import { readConsent, saveConsent } from "./consent";
import { PageHeader } from "./ui";
export function CookieNotice() {
  const [consent, setConsent] = useState(readConsent),
    [open, setOpen] = useState(false),
    [preferences, setPreferences] = useState(
      () => readConsent()?.preferences ?? false,
    );
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("unlocktr-cookie-settings", show);
    return () => window.removeEventListener("unlocktr-cookie-settings", show);
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
export function SupportPage() {
  return (
    <section className="support-page">
      <PageHeader
        eyebrow="BİRLİKTE DAHA FAZLASI"
        title="Birlikte daha iyi bir UnlockTR."
        description="Bir sorunun mu var, bir fikrin mi? Seni dinliyoruz. Topluluğun katkısıyla daha iyi bir yama platformu kuruyoruz."
      />
      <div className="panel contact-support">
        <span className="eyebrow">DESTEK & GERİ BİLDİRİM</span>
        <h2>Burada ne görmek istersin?</h2>
        <p>
          Yeni bir özellik, daha iyi bir oyun deneyimi veya karşılaştığın bir
          sorun… Fikrini bizimle paylaş. Oyun taleplerini takip edebilmemiz için
          oyun isteği sayfasını kullanabilirsin.
        </p>
        <a
          className="primary"
          href="mailto:unlocktr@haking.tr?subject=UnlockTR%20Destek"
        >
          unlocktr@haking.tr · Bize yaz
        </a>
        <a className="secondary" href="/requests">
          Oyun isteği oluştur
        </a>
        <p className="muted small">
          Hata bildirirken oyun adını, cihazını ve karşılaştığın durumu belirt.
          Şifreni veya doğrulama kodunu paylaşma.
        </p>
      </div>
      <div className="support-grid">
        <article className="panel support-card">
          <Coffee size={43} />
          <h2>Bir kahve ısmarla</h2>
          <p className="muted">
            Buy Me a Coffee üzerinden gönüllü destek verebilirsin. Destek
            göndermek otomatik VIP üyelik veya belirli bir oyun için teslim sözü
            oluşturmaz.
          </p>
          <a
            className="primary"
            href="https://buymeacoffee.com/haking"
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy Me a Coffee ile destek ol
            <ArrowUpRight size={16} />
          </a>
        </article>
        <article className="panel support-card">
          <Crown size={43} />
          <h2>VIP ile katkı sağla</h2>
          <p className="muted">
            Reklamsız alternatifler, öncelikli istek değerlendirmesi ve kurucuya
            istek bildirimi. Aylık veya yıllık üyelik seçeneklerini incele.
          </p>
          <a className="secondary" href="/vip">
            VIP avantajlarını keşfet
            <ArrowUpRight size={16} />
          </a>
        </article>
      </div>
    </section>
  );
}
export function PrivacyPage() {
  return (
    <section className="panel policy-page">
      <PageHeader
        eyebrow="ŞEFFAF DEPOLAMA"
        title="Çerez ve hesap verileri"
        description="Kullandığımız depolama ve hesabını yönetme seçenekleri."
      />
      <h2>Oturum ve güvenlik</h2>
      <p>
        Giriş yaptığında oturum belirteci bu tarayıcıda saklanır. Sunucuda iptal
        edilebilir bir oturum kaydı tutulur; 30 gün kullanılmayan veya en fazla
        90 güne ulaşan oturum yeniden giriş ister. Çıkış, şifre sıfırlama ve
        hesap silme mevcut oturumları geçersiz kılar. Ortak bilgisayarda işin
        bitince çıkış yap.
      </p>
      <h2>Kütüphane önbelleği</h2>
      <p>
        Daha hızlı açılış için yalnızca herkese açık oyun listesi bu cihazda en
        fazla 24 saat saklanır. Site açıldığında liste yenilenir. VIP indirme
        adresleri bu önbelleğe dahil değildir.
      </p>
      <h2>Tercihlerin</h2>
      <p>
        unlocktr_consent çerezi seçimini 180 gün hatırlar. İzin verdiğinde tema
        ve misafir 18+ görünüm tercihi cihazında saklanır. Üye tercihleri
        hesabınla ilişkilidir. Analitik ve reklam takip kodu eklemiyoruz. Harici
        indirme, ItemSatış veya Buy Me a Coffee sayfaları kendi politikalarını
        uygular.
      </p>
      <button
        className="secondary"
        onClick={() =>
          window.dispatchEvent(new Event("unlocktr-cookie-settings"))
        }
      >
        Çerez tercihlerimi değiştir
      </button>
      <h2>Hesap ve işlem bildirimleri</h2>
      <p>
        E-posta, görünen ad, şifre özeti, yorumlar ve oyun istekleri uygulama
        işlevleri için veritabanında tutulur. Kod ve işlem e-postaları Resend
        ile gönderilir. VIP atama ve istek durumu bildirimleri hizmet
        e-postasıdır; pazarlama bülteni değildir. Bildirim kuyruğu ve yetkili
        işlem kayıtları kurucuya açıktır.
      </p>
      <h2>Hesabını silme</h2>
      <p>
        Hesap ayarlarında şifren ve e-postana gelen kodla silme onayı
        verebilirsin. Profil/e-posta anonimleştirilir, istekler ve oturumlar
        kaldırılır; yorumlar “Silinen kullanıcı” olarak kalır. Kurucu hesabı
        için önce sahiplik devri gerekir.
      </p>
      <a href="/account" className="primary">
        Hesap ayarlarını aç
      </a>
    </section>
  );
}

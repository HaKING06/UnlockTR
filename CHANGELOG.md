# Frontend changelog

## 0.4.0 — 2026-11-17

- Açıklamalı oyun yayın stüdyosu ve ayrıntılı mod türleri, kurulum/uyumluluk notları.
- Standart reklamlı, Pixeldrain/MediaFire VIP indirmeleri; VIP öncelikli istek yönetimi.
- İşlemle atomik e-posta kuyruğu, VIP/ekip/istek bildirimleri, ret şablonları.
- Sunucuda denetlenen kalıcı giriş, Gmail kayıt kısıtı, e-posta onaylı silme.
- Altı kutulu OTP, çerez tercihleri, destek/gizlilik sayfaları ve Buy Me a Coffee.
- Kayıplı olmayan migration ve kapsamlı backend/UI kontrolleri.

## 0.3.0 — 2026-11-17

- Doğrulanmış kurucu hesabı, yardımcı kurucu/moderatör/üye yetkileri ve normal hesapla yönetim.
- Oyun düzenleme, yorum moderasyonu, istek durumu, kullanıcı arama, rol/VIP atama ve işlem geçmişi.
- Kodla e-posta doğrulama ve otomatik giriş; HTML mail, şifre sıfırlama/değiştirme ve hesap anonimleştirme.
- Aylık/yıllık manuel VIP, ekip için otomatik VIP, korumalı VIP indirme bağlantıları.
- Ayrı üyelik/hesap/VIP/oyun sayfaları, kalıcı NSFW tercihi ve iki oyun motoru.
- Mevcut kayıtları koruyan migration ve kapsamlı yetki/akış testleri.

## 0.2.3 — 2026-11-17

- Canlı Workers ortamında /verify yolunu ana sayfaya taşıyan rewrite kaldırıldı.
- Doğrulama ve admin için doğrudan HTML girişleri build sırasında üretilir.
- Eski yönlendirmeyle ana sayfaya ulaşan token bağlantıları kurtarılır.
- Token URL’den kaldırılır, bellekte saklanır; başarısız doğrulama tekrar denenebilir.

## 0.2.2 — 2026-11-17

- Workers dağıtımını engelleyen catch-all _redirects döngüsü kaldırıldı.
- Vite build yalnız /verify ve yapılandırılan admin yolu için kesin rewrite kuralları üretir.
- JavaScript, CSS ve görsel dosyaları rewrite kapsamından çıkarıldı.

## 0.2.1 — 2026-11-17

- Üretim API varsayılanı gerçek Render adresine bağlandı: unlocktr-backend.onrender.com.
- Cloudflare Pages ortam değişkeni ve kurulum belgeleri güncellendi.
- Yerel geliştirme API varsayılanı localhost olarak korundu.

## 0.2.0 — 2026-11-16

- Sinematik vitrin, özgün WebP arka plan ve yenilenen marka görünümü.
- Gece mavisi, neon mor/mavi arayüz; açık tema desteği.
- Hover efektli oyun kartları, TR Yama/Mod etiketleri ve NSFW cam efekti.
- Üyelik, yorum, istek ve kurucu ekranlarında ortak tasarım sistemi.
- Girişten sonra yorum/istek akışına dönüş, kapak yedeği ve yorum yükleme durumu.
- Mobil/tablet, klavye ve azaltılmış hareket desteği.
- Mevcut backend sözleşmesi korundu; backend değiştirilmedi.

## 0.1.0

- İlk React/Vite arayüz ve API akışları.

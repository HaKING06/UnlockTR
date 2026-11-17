# UTRZONE 0.5.0 · UTR kimliği

## Yeni deneyim
- Grafit / koyu kırmızı palet, metal UTR markası, kare favicon, responsive logo ve cam yüzeyler; açık tema ve 18+ gizlilik tercihleri korunur.
- Giriş ve doğrulama sonrası varsayılan ana sayfa; güvenli next bağlantısı varsa önceki akışa dönüş. Oturumu açık üye giriş ekranını atlar.
- Footer hesap durumuna göre değişir. Destek ve geri bildirim: utrzone@haking.tr.
- Oyun sayfasında yetkili yorum düzenleme/gizleme; backend yetki kontrolü ve audit kaydı korunur.
- İstek durumuna uygun hazır yanıtlar ve mesaj önizlemesi. İnceleme, çalışma kabulü veya teslim sözü anlamına gelmez.
- Kurucu/yardımcı kurucu için /mail posta stüdyosu; alıcı, konu, mesaj, önizleme ve açık gönderim onayı. Sunucu HTML escape, rol kontrolü, kullanıcı başına saatte 20 gönderim ve taslak tekrarını önleme uygular.
- Tüm e-posta şablonları yeni kimlikle ve PNG logo ile güncellendi; yanıt adresi utrzone@haking.tr.

## Performans
HTML başında harici async warmup.js sağlık isteğini erkenden başlatır; CSP inline script için gevşetilmez. Build çıktısı VITE_API_URL kullanır. Son başarılı herkese açık katalog 24 saat yerelde tutulur ve açılışta yenilenir; VIP adresleri ve kullanıcı bilgileri bu önbelleğe girmez. Ana sayfa dışındaki sayfalarda gereksiz katalog isteği yapılmaz. Kapaklar lazy + async decode, yeni hero yaklaşık 119 KB WebP.

Render Free 15 dakika trafiksizlik sonrası uyur ve uyanma yaklaşık bir dakika sürebilir. Bu değişiklik ilk ziyaret gecikmesini tamamen kaldırmaz. Kesintisiz hızlı başlangıç için Render servisinin uyumayan ücretli compute planı gerekir; bu teslimde plan veya faturalama değiştirilmedi. Kaynak: https://render.com/docs/free#spinning-down-on-idle

## Yayın
1. Backend deposunu push et, Render başarılı deploy olsun. Mevcut environment değişkenleri korunur; yeni secret gerekmez.
2. Frontend deposunu push et; Cloudflare build: npm run build, assets: dist. VITE_API_URL=https://unlocktr-backend.onrender.com/api.
3. E-posta logosu frontend /brand/email-logo.png adresinde yayınlanır. Gizli anahtar veya kurucu kişisel adresi görsellere yazılmadı.
4. /mail yalnız yönetim yetkili hesaplara açıktır; moderatörler ve üyeler e-posta gönderemez. Bildirimler mevcut notification_outbox üzerinden gönderilir; uyuyan serviste kuyruk uyanınca çalışır.
5. Yeni SQL migration yoktur; mevcut 0.4.0 migration uygulanmış olmalıdır. Manuel toplu e-posta ve ek dosya desteklenmez.

## Doğrulama
Backend: 13 test, PGlite test veritabanı ve sahte e-posta göndericisi. Yeni test rol reddi, güvenli şablon, idempotency ve saatlik sınırı kapsar. Playwright: 390px/768px mock API ile giriş yönlendirmesi, yorum düzenleme, istek şablonları, posta formu, 18+ tercihi ve yatay taşma. Canlı Resend teslimi veya Render performansı bu testlerin parçası değildir. Gerçek kullanıcıya test e-postası gönderilmedi, canlı veri değiştirilmedi.

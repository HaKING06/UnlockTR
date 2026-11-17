# Güvenlik politikası

## Kapsam

Mevcut kod tabanı 0.6.0'dır. Bu belge güvenlik denetimi veya kusursuzluk beyanı değildir. Eski sürümler için ayrı bakım takvimi taahhüt edilmez.

## Güvenli bildirim

Şifre, JWT, DATABASE_URL, RESEND_API_KEY, e-posta kodu, gerçek kullanıcı verisi veya çalışan saldırı ayrıntısını açık issue/PR içine koyma. GitHub deposunda özel güvenlik bildirimi etkinse o kanalı kullan. Etkin değilse önce maintainer'dan özel iletişim kanalı iste; açık mesajda yalnız özel bildirim yapmak istediğini belirt.

Rapor; etkilenen sürüm/rota, tekrar üretim koşulları, beklenen/gerçek davranış ve hassas veriden arındırılmış kanıt içerebilir. Canlı kullanıcı hesaplarına erişme, gerçek ödeme yapma veya yıkıcı test uygulama.

## Mevcut kontroller

- Zod alan doğrulama, parametreli SQL, boyut sınırları, CORS ve güvenlik başlıkları.
- bcrypt şifre özeti, HMAC kod özeti; verify/reset/delete amaçları ayrıdır.
- Kod süre/deneme/yeniden gönderim sınırları veritabanındadır.
- Rol ve VIP kararı sunucuda güncel hesaptan okunur.
- Persist edilen JWT ve hash'li session ID kaydı; süre/iptal/token_version kontrolü.
- VIP indirme URL'leri public yanıtlarda dönmez.
- İşlem bildirimleri kuyruk ve idempotency ile işlenir; kodlar loglanmaz.

## Bilinen sınırlar

JWT localStorage'dadır; HttpOnly cookie tabanlı oturum değildir. XSS'den korunma önemlidir; CSP korunmalı, kullanıcı HTML'i doğrudan enjekte edilmemelidir. Rate limit tek süreç belleğindedir; çok instance için ortak store gerekir. Gmail kısıtı tüm sahte hesapları engellemez. NSFW kapağı hukuki yaş doğrulaması değildir. Harici VIP URL'leri yeniden paylaşılabilir. Sağlayıcı kabulü inbox teslimini kanıtlamaz.

Sızmış bir sır varsa ilgili sağlayıcıda iptal/rotasyon yap; dosyadan silmek geçmişteki sızıntıyı tek başına gidermez. Log/rapor yayımlamadan önce sırları temizle. Gerçek anahtar veya doğrulama kodu isteme/paylaşma.

UCoin: yalnız sunucu hesaplar; bakiye/ledger/erişim transaction içinde kaydedilir, rol ve fiyat doğrulanır. Günlük ödül Türkiye tarihiyle, manuel yükleme işlem referansıyla tekilleştirilir. Erken erişim linkleri üyelik ve proje hakkıyla korunur. Harici URL paylaşımını engelleyen DRM sağlanmaz.

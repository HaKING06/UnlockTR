# Güvenlik politikası

## Kapsam

Mevcut kod tabanı 0.9.0'dır. Bu belge güvenlik denetimi veya kusursuzluk beyanı değildir. Eski sürümler için ayrı bakım takvimi taahhüt edilmez.

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

0.7.0: coin atama/özel rapor izinleri API üzerinde denetlenir. Alıcı kümesi ve sayı onayı toplu gönderimde zorunlu; taslak tekrarları tekilleştirilir. Favori kapasitesi ve indirme yetkisi sunucudadır. Satın alma onayı atlanamaz, satılmış oyun adı/şifre/erişim kapanması onayıyla kaldırılabilir. Ham IP indirme olayına yazılmaz.

0.9.0: is_hidden ve deleted_at bütün public erişim rotalarında denetlenir. Kalıcı yorum silme yetki, açık onay ve transaction audit gerektirir. Görsel adreslerini sunucu indirmez; browser HTTPS üzerinden alır. Sağlık kontrolü üye belirteci taşımaz.

0.9.0 CSP: Radix çalışma anı stil öğeleri için style-src-elem self/unsafe-inline kullanılır; style-src-attr none ve script-src self korunur. Bu bir nonce tabanlı katı stil politikası değildir. Kullanıcı HTML enjeksiyonu ekleme; bağımlılık güncellemesinde production CSP testi gerekir.

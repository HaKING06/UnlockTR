# UnlockTR 0.6.0 · UCoin ve erken erişim

## Önemli: yayın sırası
Bu sürüm **migrations/0.6.0.sql** gerektirir. Canlı veritabanına bu çalışma sırasında migration uygulanmadı.

1. Neon production veritabanında mevcut branch ve yedek/restore imkânını doğrula. 0.4.0 şeması önkoşuldur.
2. Backend deposundaki migrations/0.6.0.sql dosyasının tamamını Neon SQL Editor'de çalıştır. Alternatif: doğru DATABASE_URL_UNPOOLED (yoksa DATABASE_URL) bulunan backend ortamında npm run db:migrate. Sırları terminal çıktısına veya Git'e koyma.
3. Ardından backend deposunu push ederek Render 0.6.0 deploy'unu tamamla. /api/health gerekli migration yoksa 503 migration_required döndürür.
4. Sonra frontend deposunu push ederek Cloudflare build'ini yayınla. Yeni environment değişkeni yoktur.
5. /wallet, /manage-coins ve oyun düzenleyicisini kontrol et. Coin satış ilanlarını gerçek tutarlarla ItemSatış'ta ayrıca oluştur; bu kod ilan veya ödeme oluşturmaz.

Migration aktif hesapları, oyunları ve yorum içeriklerini korur. Önceden anonimleştirilmiş deleted_at dolu kullanıcı satırları kaldırılır; yorumları kullanıcı bağlantısı olmadan Silinen kullanıcı olarak kalır. Bu eski satırlardan orijinal e-posta geri üretilemez. Yeni hesap silmelerinde ayrı deleted_emails tablosuna yalnız e-posta/silinme tarihi yazılır.

## Ekonomi
| Gün | Standart | VIP / ekip |
|---|---:|---:|
| 1 | 5 | 10 |
| 2 | 6 | 12 |
| 3 | 7 | 14 |
| 4 | 8 | 16 |
| 5 | 10 | 20 |
| 6 | 12 | 24 |
| 7 | 15 | 30 |

Takvim Europe/Istanbul, günlük yenilenme 00.00. Ödül düğmeyle alınır; seri 7 günde döner, gün kaçırınca sıfırlanır. Rastgele ödül veya coin transferi yoktur. Coin nakde çevrilemez. Üyeler cüzdanda bakiye, son 50 işlem ve açılmış son 100 projeyi görür.

Önerilen manuel paketler: **100 UCoin 19 TL**, **300 UCoin 49 TL**, **700 UCoin 99 TL**. Satış mevcut ItemSatış profilinde, yükleme yalnız kurucunun doğrulamasıyla yapılır. Kurucu hediye de tanımlayabilir; miktar ve açıklama işlem defterine yazılır. Aynı işlem referansı ikinci kez kredi vermez. Bu fiyatlar başlangıç teklifidir; gerçek ilan koşullarını mağazadan kontrol et.

## Erken erişim
Oyun düzenleyicide genel erişim tarihi ve iki coin fiyatı belirlenir. Varsayılan 150 standart / 100 VIP; VIP fiyatı standarttan yüksek olamaz. Tarih boşsa genel erişim, geçmişse otomatik genel erişimdir. Tüm mevcut oyunlarda tarih başlangıçta boş: oyunlar yanlışlıkla ücretlendirilmez.

VIP erken erişimi ücretsiz açmaz. Sunucu fiyatı ve bakiyeyi doğrular; satın alım, bakiye ve ledger aynı transaction içinde kaydedilir. Aynı projeyi tekrar açmak yeniden harcatmaz. Açma hakkı proje bazındadır; sürüm güncellemeleri mevcut hakkı sıfırlamaz. Genel erişim sonrası standart indirme üyelik gerektirmeden devam eder. VIP reklamsız sağlayıcılar yalnız VIP'de ve erken erişim aktifken ayrıca proje açılmışsa döner.

Katalog ve erken erişim detay yanıtlarında kilitli indirme URL'leri dönmez. Daha önce internete açık bir indirme adresini coin duvarıyla geri gizlemek mümkün değildir: açık projeyi sonradan erken erişime çevirirsen dosya sağlayıcı adreslerini de değiştir. Harici sağlayıcı adresleri erişimi alan kişi tarafından paylaşılabilir; bu sistem DRM değildir.

## Proje ve hesap silme
- Kurucu / yardımcı kurucu projeyi oyun düzenleyicisinden; oyun adını birebir yazarak ve kendi şifresini girerek kalıcı silebilir. Moderatör silemez. Yorumlar da kaldırılır; erişim için harcanmış coinler aktif kullanıcılara tek transaction ile iade edilir. Silme audit kaydı tutulur.
- Hesap silme hâlâ şifre + e-posta kodu + SİL onayı gerektirir. Kullanıcı satırı kalıcı kaldırılır. Yorumların kullanıcı bağı koparılır; şifre, roller, VIP, cüzdan, istekler, oturumlar ve erişimler eski hesaba bağlı kalmaz.
- deleted_emails yalnız kurucu API'sine açıktır. Aynı adresle yeni üyelik doğrulandığında kayıt kalkar. Yeni hesap eski VIP, coin veya açılmış projeleri geri almaz. Kimlikten ayrılmış parasal işlem kayıtları ve anonim yorumlar tutulur.
- Coin yükleme ve proje kaldırma iadeleri için logolu bildirim e-postası kuyruğa alınır. E-posta gecikse bile bakiye işlemi kaybolmaz.

## Referans ve tasarım
RWAZONE ana sayfası açık Chrome penceresinden incelendi; bakiye görünürlüğü, kategoriler ve erişim etiketlerinin anlaşılır olması fikir olarak alındı. Kaynak kodu, marka veya yerleşim birebir kopyalanmadı. UnlockTR'nin UTR grafit/kırmızı kimliği korundu. Yeni ekranlar ana menü/hesap/yönetim akışına entegre edildi. Kurumsal e-posta bağlantısına Mail ikonu eklendi.

## Doğrulama ve sınırlar
Backend 23 test: PGlite + Supertest ve sahte mail göndericisi. Migration tekrar uygulanabilirlik, eski anonim satırlar, kayıt/doğrulama/silme, günlük tekrar, seri/VIP, idempotent yükleme, iki kez erişim alma, fiyat/rol reddi, indirme URL koruması, genel erişim tarihinin dolması, proje silme/iade, bildirim kaçışlama ve migration health kontrolünü kapsar. Test adaptörü transaction'ları seri çalıştırır; gerçek PostgreSQL pool'unda ayrı bağlantı ve satır kilitleri kullanılır. Bu bir yüksek eşzamanlı trafik benchmark'ı değildir.

Playwright MCP: yalnız 390px / 768px, mock API ile günlük ödül, cüzdan, erken erişim onayı/standart/VIP linki, kurucu manuel yüklemesi ve oyun adı+şifre silme ekranı kontrol edildi. Gerçek para işlemi veya gerçek alıcıya test maili gönderilmedi. Canlı Neon verisi değiştirilmedi, commit/push/deploy yapılmadı.

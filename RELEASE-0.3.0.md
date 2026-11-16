# UnlockTR 0.3.0 — yayınlama ve kontrol

## Yapılanlar

- `gunshalit@gmail.com` doğrulanmış hesabı tek kurucu olarak tanınır. Eski admin anahtarıyla giriş uç noktası kaldırıldı.
- Kurucu: tüm oyunlar, yorumlar, istekler, ekip rolleri, VIP ve işlem geçmişi.
- Yardımcı kurucu: oyun ekleme/düzenleme, yorum yönetimi ve istek durumu.
- Moderatör: yorum düzenleme/gizleme/geri gösterme ve istekleri okuma; oyun ekleyemez/düzenleyemez.
- Roller her API isteğinde veritabanından kontrol edilir. Rol değişikliği aktif tokena hemen yansır.
- Kurucu, yardımcı kurucu ve moderatörler görevleri sürdükçe sınırsız VIP alır.
- Kurucu e-posta/ad ile üye arayıp +1 takvim ayı veya +1 takvim yılı VIP atar. Aktif süre varsa üzerine eklenir. VIP kaldırılabilir; personelin otomatik VIP erişimi rolüne bağlıdır.
- VIP fiyatları aylık 49 TL / yıllık 399 TL olarak gösterilir. ItemSatış mağazası: https://www.itemsatis.com/profil/haking06.html . Sitede ödeme/otomatik abonelik yoktur; mağazada güncel ilan koşulları geçerlidir. Kurucu satış olmadan da VIP atayabilir.
- VIP Pixeldrain bağlantıları herkese açık API yanıtlarından çıkarıldı; aktif VIP kontrolünden sonra alınır. Harici linki bir VIP kullanıcısının paylaşmasını teknik olarak engelleyen bir dosya sunucusu/DRM yoktur.
- Yeni kayıt: şifre + e-posta → 6 haneli kod → doğrulama sonrası otomatik oturum. Kod 10 dakika, en fazla 5 deneme; yeniden gönderim 60 saniye. Kod HMAC özeti saklanır. Eski doğrulama e-postaları geçişte desteklenir.
- Tasarımlı HTML/text e-posta, şifre sıfırlama, şifre değiştirme, token sürümüyle oturum iptali.
- Hesap silme profil/e-postayı anonimleştirir, istekleri siler, oturumları kapatır. Yorumlar Silinen kullanıcı olarak kalır; bu davranış onay ekranında açıklanır. Kurucu hesabı sahiplik devri olmadan panelden silinemez.
- NSFW tercihi misafir için tarayıcıda, üye için hesapta saklanır. Bu yaş doğrulama hizmeti değildir.
- /login, /register, /verify, /forgot-password, /account, /vip, /manage ayrı sayfalardır. Oyun adresi /game?id=UUID biçimindedir; paylaşılabilir, popup açmaz. Yetkili hesaplar oyundan doğrudan düzenleme ekranına gider.
- Motor seçenekleri Ren'Py ve Unity. Eski PostgreSQL enum etiketleri veri kaybı yaratmamak için yerinde bırakılır; yeni API yalnız bu iki motoru kabul eder.

## Neon

0.3.0 migration'ı önce production kopyasında, ardından canlı production/neondb üzerinde uygulandı. Önce/sonra 2 kullanıcı, 1 oyun ve 0 yorum korundu. Kurucu e-postasının doğrulanmış olduğu teyit edildi. Geçici test branch'i kaldırıldı. Bu sürümde tekrar SQL çalıştırman gerekmez.

Yeni kurulum için backend'de npm run db:migrate hem schema.sql hem migrations/0.3.0.sql çalıştırır. Mevcut kurulumlara yalnız sürüm migration'ı uygulanabilir. Migration tekrar çalıştırılabilir; tablo silmez.

## Yayın sırası — önemli

1. GitHub Desktop → C:\GitHub\UnlockTR-Backend → değişiklikleri commit ve push.
2. Render'da backend deploy'unu bekle. /api/health sürümü **0.3.0** olmalı.
3. Render Environment'e `FOUNDER_EMAIL=gunshalit@gmail.com` eklemek önerilir; kodda aynı varsayılan vardır. Mevcut DATABASE_URL, RESEND_API_KEY, JWT_SECRET ve FRONTEND_URL korunur. ADMIN_SECRET_KEY artık kullanılmaz ve kaldırılabilir. JWT_SECRET'i sırf bu geçiş için değiştirmek gerekmez.
4. Sonra C:\GitHub\UnlockTR → commit ve push. Cloudflare build/deploy tamamlanmalı.
5. FRONTEND_URL=https://unlocktr.haking.tr, VITE_API_URL=https://unlocktr-backend.onrender.com/api. VITE_ADMIN_ROUTE_SLUG eski panel bağlantısının da çalışması için korunabilir; yeni ana yönetim yolu /manage.
6. Sitede yeniden giriş yap. Yeni oturum modeli sessionStorage kullanır; sekmeyi yenileyince oturum sürer, tarayıcı oturumu kapanınca tekrar giriş gerekir. Tüm tokenlar 2 saat geçerlidir. Gizli admin anahtarı girilmez.
7. Profil menüsü → Yönetim merkezi. Üyeler ve VIP sekmesinde üye e-postası ara; rol veya VIP ata. Kurucu yetkileri doğrulanmış FOUNDER_EMAIL'e bağlıdır; farklı bir hesaba kurucu atanmaz.

Backend ve frontend birlikte güncellenmelidir. Eski backend ile yeni frontend uyumlu değildir. Henüz deploy edilmemiş yerel kaynaklar, canlıda çalışıyor olarak değerlendirilmemelidir.

## Kontrol

- Backend: npm test (PGlite, sahte mail göndericisi). Migration veri koruma/idempotency, OTP, yetkiler, VIP gizliliği/süre/revoke, moderasyon, rol değişimi, şifre/oturum, hesap anonimleştirme testleri.
- Frontend: npm run build ve npm run format:check.
- Playwright: yalnız 390px/768px; mock API ile kayıt/kod/otomatik giriş, oyun URL'si, NSFW tercih kalıcılığı, admin oyun düzenleme, VIP/rol atama, moderatör sınırları ve hesap/VIP/giriş/kayıt sayfaları. Yatay taşma görülmedi.
- Canlı Neon migration doğrulandı. Yeni API uç noktaları ve HTML e-posta teslimi Render deploy'u sonrasında gerçek hesaplarla tekrar sınanmalıdır. Sahte UI testleri gerçek ödeme veya Resend teslim testi değildir.
- E-posta kodlarını veya şifreleri paylaşma. Test için mağazada ödeme yapmana gerek yok; kurucu manuel üyelik atayabilir.

## Bilinen sınırlar

- Google arama alt bağlantıları (sitelinks) garanti edilemez. Ayrı giriş/kayıt/VIP sayfa başlıkları, navigasyon ve sitemap eklendi. Hesap/yönetim/doğrulama ve dinamik oyun girişinde noindex kullanılır; oyunların aramada ayrı indekslenmesi için sonraki SSR/SEO çalışması gerekir.
- RWAZONE iç sayfaları erişim engeli/sertifika hatası nedeniyle incelenemedi; akış kullanıcı referansı esas alınarak özgün tasarlandı.
- Rate limit tek Render instance belleğindedir; OTP deneme ve yeniden gönderim sınırları ayrıca veritabanındadır. Çok instance öncesi ortak rate-limit store gerekir.
- Liste sınırları: katalog 24, yönetim oyun/yorum 50 sayfalı, üye arama ilk 50, istek/işlem geçmişi son 100. Üye aramada e-postayla daralt.

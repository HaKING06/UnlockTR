# UTRZONE 0.8.0 · 17 Kasım 2026

Yeni kimlik: **UTRZONE — Underground Translation & Reworks** (Yeraltı Çeviri & Yeniden Yapımlar). Site https://utrzone.haking.tr; destek/gönderici utrzone@haking.tr.

## Marka ve arayüz

Kullanıcının yeni logolar.jpg paftasından navbar, mobil/footer, marka izi ve kilitli U favicon/app ikonları kırpıldı. Harfler SVG ile yeniden çizilmedi. WebP web logoları, PNG e-posta ve paylaşım kartı, ICO/Apple/PWA ikonları aynı kaynağı kullanır. Yeni afişler eski marka afişlerinin yerini alır.

Başlıklar, SEO/sitemap, sosyal kartlar, manifest, e-posta çerçevesi, destek bağlantıları, istemci depolaması ve olay adları UTRZONE olarak güncellendi. Çalışan Render hostname'i, gerçek GitHub remote/checkout ve Windows yolları yeniden adlandırılmadı. Bunlar görünür marka metni değildir.

Kırmızı/grafit cam yüzeyler ve light/dark tema korunur. İstek kartı 390px'de tek sütun; 768px'de düzenli grid. Navbar hesap kontrolleri dar ekranda logoyla aynı satıra alınır; footer metinleri soldan hizalanır. +18 kapağı tercih verilene kadar bulanıktır.

## Proje kaldırma

Kurucu ve yardımcı kurucu satılmış projeleri de kaldırabilir. Proje adı birebir yazılır, mevcut şifre ve erişim kapanması/iadesizlik kutusu zorunludur; API de onayı denetler. Moderatöre bu izin verilmez. Satın alanın dosyayı indirmiş olduğu varsayılmaz; kaldırma sonrası yeniden indirme erişimi kapanır, otomatik coin iadesi yapılmaz. Satın alma onayında bu durum açıklanır; kanuni haklar saklıdır.

`games.deleted_at` ile yayından kaldırılır; satış/coin/audit kayıtları raporlar için korunur. Katalog, detay, VIP/standart indirme, erken erişim, favori ve yorum gönderimi kaldırılan projeyi sunmaz. Bekleyen proje bildirimleri iptal edilir. Raporlar kaldırılan projeyi etiketli gösterir. Bu işlem dosyanın harici sağlayıcıdan veya kullanıcının cihazından silinmesi değildir.

## Görsel deposu

Mevcut `https://utr.haking.tr` görsel sunucusu ve `/games/...` kapak adresleri korunur. Marka paketi `/brand/utrzone-v080/` altında sürümlü/uzun önbellekli olarak hazırlanmıştır. Kritik logolar ilk açılış ve e-posta güvenilirliği için frontend public içinde de tutulur; yeni görsel deposu deploy'ına bağımlı açılış eklenmedi. Doğrudan görsel adresleri public'tir; robots.txt erişim güvenliği değildir. Görsel deposunun yerel tools/ araçları yayına kopyalanmaz.

## Yapman gereken yayın ayarları

1. Render Environment: `FRONTEND_URL=https://utrzone.haking.tr`. JWT_SECRET, DATABASE_URL, RESEND_API_KEY, FOUNDER_EMAIL ve mevcut servis adı/URL'si korunur. Gönderici kodda UTRZONE <utrzone@haking.tr>, Reply-To aynı adrestir. Yeni secret gerekmez.
2. `utrzone@haking.tr` gelen posta yönlendirmesini/gelen kutusunu oluştur. Resend'de doğrulanmış `haking.tr` alan adı ve bu alan adına gönderim izni olan mevcut anahtar kullanılır; bir posta kutusu ayrıca gereklidir. SMTP kurulumu eklenmedi.
3. Backend deposunu push et. `/api/health`: status ok, version 0.8.0 beklenir. Migration 0.8.0 önce Neon production kopyasında iki kez, sonra production üzerinde uygulanmıştır; mevcut hesap/oyun/bakiyeler/satışlar korunmuştur. Yeni kurulumda npm run db:migrate bütün geçişleri uygular.
4. Frontend Cloudflare build değişkeni `VITE_API_URL=https://unlocktr-backend.onrender.com/api` olarak kalır. `VITE_ADMIN_ROUTE_SLUG=founder-console` korunur. Custom Domain olarak `utrzone.haking.tr` ekle. Frontend push sonrası yeniden build/deploy gerekir.
5. Görsel deposunu push et; mevcut `utr.haking.tr` ve yayın dizini public korunur. Diğer iki deponun klasör/remote adlarını değiştirmek gerekmez.
6. Yeni alan adında bir kez giriş yap. Eski alan adının localStorage/kurulu uygulama oturumu başka origin'e aktarılmaz; yeni JWT kimliği de değişti. İstersen eski alan adı için ayrıca yeni adrese yönlendirme kur; bu teslim Cloudflare DNS/redirect veya Render env ayarlarını otomatik değiştirmedi.

## Doğrulama

31 PGlite/Supertest testi: rol izinleri, kaldırma onayı, iadesizlik, bütün erişim yollarının kapanması, satış arşivi ve yeni e-posta kimliği dahil. Frontend build/format ve git diff kontrolleri. Playwright 390/768px: vitrin, istek düğmesi, giriş/kayıt, oturumla ana sayfaya dönüş, mail önizlemesi, proje kaldırma ve arşiv raporu; taşma görülmedi. İzole yerel Express/PGlite kullanıldı; örnek harici kapak URL'si 404 verdi ve marka fallback'i çalıştı. Gerçek üretim hesabı silinmedi, oyun kaldırılmadı, mail/ödeme gönderilmedi. Test tarayıcısı ve yerel test sunucuları kapatılır.

Bu çalışma yük testi veya bağımsız güvenlik/hukuk denetimi değildir. Yeni alan adının gerçek TLS/DNS ve e-posta teslimi kullanıcı yayın adımlarından sonra doğrulanmalıdır.

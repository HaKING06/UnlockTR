<p align="center"><img src="docs/media/utrzone-banner.webp" alt="UTRZONE — Underground Translation & Reworks" width="100%" /></p>
<p align="center"><strong>Oyunun dilini değiştir. Kendi deneyimini kur.</strong><br />Türkçe yamalar · Ren’Py & Unity modları · Oyuncu topluluğu</p>
<p align="center"><a href="https://utrzone.haking.tr">Platformu keşfet</a> · <a href="https://utrzone.haking.tr/register">Topluluğa katıl</a> · <a href="https://utrzone.haking.tr/vip">VIP ayrıcalıkları</a></p>
<p align="center"><img alt="Version" src="https://img.shields.io/badge/version-0.11.4-b91c1c" /> <img alt="React" src="https://img.shields.io/badge/React-19-202020" /> <img alt="Vite" src="https://img.shields.io/badge/Vite-7-202020" /></p>

## Deneyim

UTRZONE, **Underground Translation & Reworks**: Türkçe yama ve modları düzenli bir katalogda bir araya getirir. Kömür grisi ve kırmızı marka kimliği; masaüstü, mobil ve uygulama görünümünde ortak bir deneyim sunar.

| Keşfet | Katıl | Destekle |
| :--- | :--- | :--- |
| Aranabilir Ren’Py ve Unity kataloğu | Favoriler, yorumlar ve oyun istekleri | VIP ve UCoin üyelik deneyimi |
| Otomatik ve elle kontrollü görsel galerisi | E-posta ile doğrulanmış hesaplar | Günlük ödüller ve erken erişim |
| Açık / koyu tema, yetişkin kapak filtresi | Hesap ve bildirim tercihleri | Reklamsız VIP indirme bağlantıları |

Kataloğu gezmek için üyelik gerekmez. Üyelik, rol, VIP ve erken erişim izinleri sunucuda denetlenir.

## Geliştirmeye başla

**Node.js 22.12+** kullanın. Bu deponun kökü frontend uygulamasıdır.

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

| Değişken | Açıklama |
| :--- | :--- |
| `VITE_API_URL` | Yerel: `http://localhost:3001/api`; üretim: `https://unlocktr-backend.vercel.app/api` |
| `VITE_ADMIN_ROUTE_SLUG` | Yönetim girişinin URL parçası; bir güvenlik anahtarı değildir |

`VITE_` değişkenleri tarayıcıya açıktır. Veritabanı ve Resend anahtarları yalnız backend ortamında tutulur.

## Doğrulama ve yayın

```powershell
npm test
npm run build
npm run format:check
```

Cloudflare Workers Static Assets: **build** `npm run build`, **çıktı** `dist`, **deploy** `npx wrangler deploy`. Mevcut projenin ayarlarını koruyun. Özel alan adı: **utrzone.haking.tr**.

Build, doğrudan açılan uygulama rotaları için HTML girişleri üretir. HTML ile fingerprintli dosyalar farklı önbellek politikaları kullanır. API ayrı bir Render servisinde çalışır; ücretsiz servisin ilk uyanışı gecikebilir.

## Platform hakkında

[Hakkımızda](https://utrzone.haking.tr/about) · [Yardım merkezi](https://utrzone.haking.tr/help) · [Reklam & iş birliği](https://utrzone.haking.tr/advertise) · [İçerik & telif](https://utrzone.haking.tr/content-policy)

## Proje ailesi

[Backend API](https://github.com/HaKING06/UnlockTR-Backend) · [Görsel arşivi](https://github.com/HaKING06/UnlockTR-Images) · [İletişim](mailto:utrzone@haking.tr) · [Destek ol](https://buymeacoffee.com/haking)

[Katkı rehberi](CONTRIBUTING.md) · [Güvenlik bildirimi](SECURITY.md) · [Topluluk ilkeleri](CODE_OF_CONDUCT.md) · [Lisans](LICENSE)

## Açılış performansı

Katalog son başarılı listeyi cihazdan gösterirken arka planda yenilenir. Yönetim ve hesap ekranları ayrı JavaScript parçaları olarak yüklenir. İlk ana görsel önceliklidir; katalog kapakları tembel yüklenir. Hash içeren JS/CSS dosyaları bir yıl önbelleklenir; HTML yeniden doğrulanır. Vercel API’nin herkese açık katalog önbelleği özel hesap ve indirme işlemlerinden ayrıdır.

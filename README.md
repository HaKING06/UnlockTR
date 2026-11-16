# UnlockTR Frontend

**Frontend version: 0.2.2** — Türkçe oyun yamaları ve modları için React/Vite arayüzü.
Hedef adres: https://unlocktr.haking.tr

## Geliştirme

Node.js 22.12+ gerekir.

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

`.env` dosyasında `VITE_API_URL` backend API adresidir. Örnek: `http://localhost:3001/api`. `VITE_ADMIN_ROUTE_SLUG`, backend `ADMIN_ROUTE_SLUG` ile aynı olmalıdır. Varsayılan kurucu yolu `/founder-console`.

```powershell
npm run format:check
npm run build
npm run preview
```

## Cloudflare Pages

Bu depo yalnızca frontend içerir; Root Directory **boş / depo kökü**, Build Command `npm run build`, Output Directory `dist`. Monorepo içindeki Desktop kopyasından dağıtım yapılıyorsa Root Directory `frontend` seçilir.

| Build ortam değişkeni | Değer |
|---|---|
| `VITE_API_URL` | Render API adresi, sonunda `/api`; örneğin `https://unlocktr-backend.onrender.com/api` |
| `VITE_ADMIN_ROUTE_SLUG` | Backend ile aynı kurucu yol adı |

Bu iki değer herkese açıktır. Değiştirildiğinde yeniden build gerekir. Veritabanı adresi, Resend anahtarı, JWT_SECRET ve ADMIN_SECRET_KEY frontend'e **eklenmez**. Custom domain: `unlocktr.haking.tr`. `public/_redirects` SPA yollarını, `public/_headers` güvenlik başlıklarını sağlar.

## Arayüz

- Sinematik, projeye özel görsel; gece mavisi yüzeyler ve mor/mavi vurgular.
- Kategori ve motor filtreleri, sunucuda oyun adı arama ve sayfalama; filtreler yüklenen oyunlara uygulanır.
- Hover hareketleri, belirgin TR Yama / Mod etiketleri, görsel yüklenemediğinde kapak alternatifi.
- Varsayılan NSFW bulanıklığı, cam efekti ve 18+ onayı. Tercih kalıcı saklanmaz; hukuki yaş doğrulaması değildir.
- Yerleşik dialog ile klavye odağı/Escape; açık/koyu tema, azaltılmış hareket desteği ve mobil düzen.
- Giriş, kayıt, doğrulama e-postası yeniden gönderimi; girişten sonra yorum/istek akışına dönüş.
- Kurucu oyun formu, yorum moderasyonu ve oyun istekleri. Mevcut backend API sözleşmesi korunur.
- Tokenlar yalnızca sayfa belleğinde tutulur. Gerçek izin ve e-posta doğrulama kontrollerini backend uygular.

## Kod

`src/main.jsx`: ana sayfa, kartlar, navigasyon ve oturum görünümü.
`src/components.jsx`: üyelik, oyun detayı, istek ve kurucu ekranları.
`src/api.js`: API istemcisi ve ortak sabitler.
`src/style.css`: temalar, responsive düzen, animasyonlar.
`public/images/unlocktr-world.webp`: Imagegen ile üretilen özgün vitrin görseli (~167 KiB); gerçek bir oyunun kapağı değildir. Yeniden üretim için API anahtarı gerekmez; mevcut görsel yerelde paketlenir. Lucide ikonları kullanılır. Animasyonlar CSS ile sağlanır.

## Yerel depo yolları

Kullanıcının 16 Kasım 2026 tarihinde bildirdiği yollar:

- Geliştirme: `C:\Users\halit\Desktop\WEB\UnlockTR\frontend`
- Frontend GitHub deposu: `C:\GitHub\UnlockTR`
- Backend GitHub deposu: `C:\GitHub\UnlockTR-Backend`

Frontend kaynakları frontend deposunun köküne kopyalanır. `.git`, `.env`, `node_modules`, `dist` ve önizleme ekran görüntüleri aktarılmaz. Backend bu tasarım tesliminde değiştirilmedi; kendi sürümü 0.1.0 olarak kalır. Bu paket bağımsız frontend sürümü 0.2.2'dır. Push işlemi kullanıcıya bırakılır.

## Doğrulama

0.2.0 için üretim build'i ve biçim kontrolü çalıştırıldı. Playwright ile yalnızca 390px ve 768px genişliklerinde yatay taşma, kategori/motor/arama, NSFW açma, indirme bağlantıları, kayıt/giriş/istek ve admin yayın/moderasyon arayüzleri denetlendi. API yanıtları bu kontrollerde **mock** edildi. Canlı Neon/Resend, gerçek JWT yetkileri veya gerçek dosya indirmeleri bu frontend tesliminde sınanmadı. API kapalıyken gerçek hata görünümü de kontrol edildi. Test oyunları dağıtılan kaynaklara eklenmedi.

Tasarımda geniş görsel alanı ve kategori düzeni için Steam/NexusMods yaklaşımı referans alındı; marka görseli projeye özel üretildi. Açık kaynak lisansı henüz seçilmedi; LICENSE dosyasına bak.

## Üretim API adresi (0.2.1)

Render: https://unlocktr-backend.onrender.com
Pages VITE_API_URL: `https://unlocktr-backend.onrender.com/api`. VITE değişkeni verilmezse üretim build bu adresi kullanır; yerel geliştirme varsayılanı localhost:3001 olarak kalır. Backend FRONTEND_URL üretimde `https://unlocktr.haking.tr` olmalıdır.

## Cloudflare Workers dağıtım notu (0.2.2)

Cloudflare ekranındaki `/workers/scripts/` deploy adresi Workers Static Assets dağıtımını gösterir. Bu model de frontend için kullanılabilir. Build `npm run build`, assets dizini `dist` olmalıdır; mevcut deploy komutunu koru. Vite artık `dist/_redirects` dosyasını yalnızca `/verify` ve VITE_ADMIN_ROUTE_SLUG yolları için üretir. `/* /index.html 200` kuralı Workers tarafından döngü olarak reddedildiği için kaldırıldı. Özel bir Worker veya sır eklenmedi. Yeni frontend yolları eklenirse build kuralları da güncellenmelidir.

Bu düzeltme üretim build ve üretilen route/asset dosyalarıyla yerelde kontrol edildi; Cloudflare remote deploy kullanıcı tarafından yapılacaktır.

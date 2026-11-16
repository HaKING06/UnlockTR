# UnlockTR Frontend — 0.3.0

React/Vite, Lucide, CSS animasyonları. Repo: C:\GitHub\UnlockTR. Yerel kaynak: C:\Users\halit\Desktop\WEB\UnlockTR\frontend.

Node.js 22.12+; `npm ci`, `npm run dev`, `npm run build`, `npm run format:check`.

## Cloudflare Workers Static Assets / Pages

Root Directory boş; build `npm run build`; assets/output `dist`.

- VITE_API_URL=https://unlocktr-backend.onrender.com/api
- VITE_ADMIN_ROUTE_SLUG=founder-console (eski yönetim yolu alias'ı)

Üretim API varsayılanı Render adresidir; yerel varsayılan localhost:3001/api. Render FRONTEND_URL=https://unlocktr.haking.tr olmalıdır. Gizli değerler frontend'e eklenmez.

Vite, her sabit sayfa için HTML girişi üretir: /login, /register, /verify, /forgot-password, /account, /game, /vip, /manage ve eski admin slug. _redirects kullanılmaz. Oyunlar /game?id=UUID üzerinden açılır; doğrudan yenileme ve paylaşma desteklenir. Başlıkları ve sitemap'i olan giriş/kayıt/VIP sayfaları sunulur; Google sitelinks garantisi yoktur. Hesap/yönetim/oyun sorgu girişleri noindex olarak işaretlenir.

## Uygulama

- src/state.jsx: sessionStorage oturumu, gerçek /me kontrolü, kalıcı NSFW tercihi.
- src/auth-pages.jsx: giriş/kayıt, 6 haneli kod, otomatik giriş, şifre sıfırlama.
- src/member-pages.jsx: hesap ayarları/silme/şifre değiştirme, VIP ve ayrı oyun sayfası.
- src/admin-page.jsx: role göre yönetim, oyun düzenleme, yorum moderasyonu, e-postayla üye arama, rol/VIP atama, işlem geçmişi.
- src/main.jsx: vitrin, katalog, menü, gerçek oyun bağlantıları.
- src/components.jsx: kapak, istek formu, istek dialog'u.
- public/images/unlocktr-world.webp: projeye özel üretilmiş görsel; gerçek oyun kapağı değildir.

Backend 0.3.0 önce yayınlanmalıdır; sonra frontend push edilir. Eski ADMIN_SECRET_KEY giriş alanı yoktur. Kurucu gunshalit@gmail.com doğrulanmış hesabıyla giriş yapar. Yönetim linki profil menüsünde görünür.

VIP 49 TL/ay ve 399 TL/yıl; ItemSatış mağazasına bağlanır, bu sitede ödeme veya otomatik etkinleştirme yapılmaz. Kurucu manuel atar. Personel görevleri boyunca sınırsız VIP alır. VIP linki sunucudan yalnız yetkili üyeye verilir. NSFW tercihi cihazda/hesapta saklanır; yaş doğrulaması değildir.

Hesap silme ekranı profilin anonimleştirildiğini ve yorumların Silinen kullanıcı olarak kaldığını açıklar. Kurucu hesabı sahiplik devri olmadan silinmez.

Kontrol: build/format ve 390px/768px mock API Playwright akışları. Gerçek yeni API/Resend teslimatı deploy sonrası sınanmalıdır. Ayrıntılı geçiş notları: RELEASE-0.3.0.md.

.git ve .env kopyalanmaz; node_modules, dist, preview PNG'leri Git dışında tutulur. Açık kaynak lisansı henüz seçilmedi.

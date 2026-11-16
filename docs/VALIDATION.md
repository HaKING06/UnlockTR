# Kontrol ve teslim rehberi

## Frontend

```powershell
npm ci
npm run format:check
npm run build
```

Geniş UI değişikliğinde mevcut Playwright MCP ile 390px/768px incele. Login/kayıt/kod, oyun bağlantısı, NSFW tercihi, VIP kapısı, mod paneli, istek yanıtı ve çerez düğmeleri ilgili değişikliğe göre seçilir. Gerçek ödeme veya rastgele üyeye e-posta gönderimi test olarak yapılmaz.

## Backend

```powershell
npm ci
npm test
```

PGlite + Supertest testleri gerçek Neon veya Resend teslim testi değildir. Son 0.4.0 kod tesliminde 12 test geçti. Migration: önce geçici Neon branch/test DB, sonra kontrollü canlı geçiş. Gerçek DATABASE_URL ve anahtarları dosya/çıktıda paylaşma.

## Yayın sırası

1. Backend değiştiyse önce backend commit/push ve Render sonucu. /api/health kod sürümünü kontrol et; health tek başına tüm tablo/akışları kanıtlamaz.
2. Ardından frontend commit/push ve Cloudflare build/deploy.
3. VITE değişkeni değişirse yeniden build gerekir. Runtime Worker secret alanı Vite build env yerine geçmez.
4. Asıl origin unlocktr.haking.tr ile test et; pages.dev/localhost CORS ayarı aynı değildir.
5. Rol/VIP/gönderim testini yetkili test hesaplarıyla yap. Sahte satış veya gerçek kullanıcı içeriği üretme.

## Sürüm ve raporlama

Bu doküman/afiş teslimi 0.4.0 sürümünü korur; paket ve uygulama davranışı değişmez. Sonraki gerçek kod tesliminde kullanıcı talimatına uygun sürüm kararı ver. Test etmediğin canlı davranışı başarılı gibi sunma. Güvenlik/erişilebilirlik/Google sıralaması için kanıtsız garanti verme.

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

PGlite + Supertest testleri gerçek Neon veya Resend teslim testi değildir. 0.5.0 tesliminde 13 test geçti. Migration: önce geçici Neon branch/test DB, sonra kontrollü canlı geçiş. Gerçek DATABASE_URL ve anahtarları dosya/çıktıda paylaşma.

## Yayın sırası

1. Backend değiştiyse önce backend commit/push ve Render sonucu. /api/health kod sürümünü kontrol et; health tek başına tüm tablo/akışları kanıtlamaz.
2. Ardından frontend commit/push ve Cloudflare build/deploy.
3. VITE değişkeni değişirse yeniden build gerekir. Runtime Worker secret alanı Vite build env yerine geçmez.
4. Asıl origin utrzone.haking.tr ile test et; pages.dev/localhost CORS ayarı aynı değildir.
5. Rol/VIP/gönderim testini yetkili test hesaplarıyla yap. Sahte satış veya gerçek kullanıcı içeriği üretme.

## Sürüm ve raporlama

Güncel uygulama sürümü 0.5.0. Bu sürüm yeni schema migration gerektirmez. Sonraki gerçek kod tesliminde kullanıcı talimatına uygun sürüm kararı ver. Test etmediğin canlı davranışı başarılı gibi sunma. Güvenlik/erişilebilirlik/Google sıralaması için kanıtsız garanti verme.

## 0.7.0 · 2026-11-17

29 backend testi, frontend production build ve format kontrolü geçti. İzole yerel Express/PGlite ile 390/768 px Playwright kontrolü: giriş, coin geçmişi/ekleme, favori, satın alma onayı, özel raporlar, mail alıcı önizleme/onayı, tema ve menü; taşma görülmedi. Harici indirme sayfası fixture; gerçek mail/ödeme yok. Neon migration iki kez test dalında, sonra mevcut veriyi karşılaştırarak production üzerinde uygulandı. Ayrıntı: ../RELEASE-0.7.0.md.

## 0.8.0 · UTRZONE

31 backend testi, frontend build ve format kontrolü. 390/768px izole yerel API ile vitrin, giriş/kayıt, istek kartı, hesap yönlendirmesi, mail önizleme, onaylı kaldırma ve rapor kontrolü; taşma görülmedi. Örnek kapak 404 fallback kontrolü; gerçek mail/ödeme/yıkıcı canlı işlem yok. Neon migration test dalında iki kez, sonra production üzerinde veri korunumu kontrolüyle uygulandı. Ayrıntılar ../RELEASE-0.8.0.md.

## 0.9.0

34 backend + 3 frontend VM testi geçti. 390/768px izole gerçek yerel API ile liste/klavye, dark varsayılan, light logo, galeri, kaydetme, rapor, yorum silme, yönetim ve giriş kontrolü; yatay taşma yok. Görsel fixture kullanıldı; gerçek mail/ödeme/silme yok. SQL önce production kopyasında iki kez, sonra veri karşılaştırmasıyla production üzerinde uygulandı. Ayrıntı ../RELEASE-0.9.0.md.

0.9.0 production CSP: derlenmiş dosyalar gerçek _headers ve yerel test API endpointiyle açıldı. 390/768px Select menüsü/seçim/Escape; sıfır konsol hatası. Dinamik stil engeli yalnız style öğelerine izin verilerek düzeltildi; script kuralı değişmedi.

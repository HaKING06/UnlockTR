# Başka bir AI'a verilecek hazır görev

Aşağıdaki metni kopyala; köşeli parantezdeki hedefi değiştir.

```text
UnlockTR adlı mevcut oyun çevirisi/mod platformunda çalışıyoruz. Kod sürümü 0.4.0; bu görsel/dokümantasyon çalışmasında sürümü artırma.

Önce AGENTS.md, docs/AI_HANDOFF.md, docs/ARCHITECTURE.md ve docs/VISUAL_BRIEF.md dosyalarını oku. Projeyi sıfırdan kurma; yalnız hedefe ilişkin dosyaları incele.

Frontend: React/Vite/Lucide/CSS, Cloudflare Workers Static Assets. Backend: Express/Neon/Resend, ayrı depo. Görsel görevde backend veya canlı veritabanını değiştirme. GitHub checkout'ları C:\GitHub\UnlockTR ve C:\GitHub\UnlockTR-Backend. Geliştirme kopyaları Desktop\WEB\UnlockTR altında; hangi kopyada çalıştığını belirt ve sonunda yalnız yetkili değişiklikleri GitHub kopyasıyla eşitle.

Hedefim: [iyileştirilecek ekranı ve istediğin görsel yönü buraya yaz].

Mevcut oturum, roller, VIP koruması, kod doğrulama, e-postayla silme, NSFW ve çerez tercihleri çalışmaya devam etmeli. API anahtarlarını isteme veya çıktıya yazma. Yeni mock/test oyunlarını canlıya koyma. Oyunlar /game?id=UUID sayfasında açılır. Workers için /* /index.html 200 kuralı ekleme.

Önemli UI değişikliğinde yalnız 390px/768px kısa kontrol yap; dark/light, taşma ve ana etkileşimleri incele. Gerçek servis ile mock sonuçlarını ayır. Sadece metin veya küçük stil değişikliğinde gereksiz tarayıcı çalıştırma.

Sonuçta değişen dosyaları, neyi neden değiştirdiğini, yapılan kontrolleri ve varsa doğrulanmamış canlı davranışı açıkla. Ben ayrıca istemedikçe commit/push/deploy yapma. Lisansı değiştirme. Sürümü 0.4.0 olarak koru.
```

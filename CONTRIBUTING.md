# Katkı rehberi

UnlockTR'ye katkı vermeden önce mevcut mimariyi ve lisans notunu incele. Bu depo açık kaynak lisansı altında yayımlanmış değildir; katkı kabulü veya depoya erişim, otomatik kullanım/dağıtım hakkı vermez.

## Başlamadan önce

1. AGENTS.md ve docs/AI_HANDOFF.md oku.
2. Hatanın tekrar üretimini veya değişikliğin kullanıcıya etkisini açıkla.
3. Küçük, amaca odaklı bir branch kullan; ilgisiz refactor ve bağımlılık yükseltmesini aynı değişikliğe ekleme.
4. Çalıştığın deponun frontend mi backend mi olduğunu doğrula. Görsel görevde backend veya canlı veritabanını değiştirme.

## Geliştirme

Frontend: npm ci, npm run dev; kontrol için npm run format:check ve npm run build.
Backend: npm ci, npm test; ortam örneği .env.example, şema geçişleri migrations altında.

Gerçek anahtarları .env.example dosyasına koyma. node_modules, dist, .env ve test ekran görüntülerini commit etme. Yeni test verilerini canlıya yazma. Migration'ı önce test/branch üzerinde dene.

## Tasarım katkıları

Türkçe metin, dark/light tema, klavye odağı, NSFW tercihi ve prefers-reduced-motion korunmalı. Önemli UI değişikliklerini yalnız 390px ve 768px ile kontrol et. Sahte istatistik/yorum, aldatıcı VIP vaadi veya zorunlu kabul tasarımı ekleme. docs/VISUAL_BRIEF.md temel referanstır.

## Pull request

- Somut sorun ve yeni davranışı anlat.
- Değişen alanı, kontrol sonucunu ve doğrulanmamış canlı davranışı belirt.
- UI değişikliğinde kişisel veri içermeyen ilgili ekran görüntüsünü ekle.
- Mock API sonuçlarını gerçek servis testinden ayır.
- Kullanıcı açıkça sabit sürüm istediyse sürümü koru; bu doküman teslimi 0.6.0'da kalır.
- Lisansı, rol kararlarını, VIP fiyatını veya ödeme modelini ayrıca yetki verilmeden değiştirme.

İş akışı şablonları .github altında bulunur. Güvenlik açığı için açık issue'ya hassas ayrıntı koyma; SECURITY.md rehberini izle.

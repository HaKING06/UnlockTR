# UnlockTR frontend çalışma notu

- Yerel geliştirme: `C:\Users\halit\Desktop\WEB\UnlockTR\frontend`.
- Frontend GitHub checkout: `C:\GitHub\UnlockTR` (repo kökü frontend projesidir).
- Backend GitHub checkout: `C:\GitHub\UnlockTR-Backend`. Frontend tasarım görevlerinde backend dosyalarını değiştirme.
- Bu yollar kullanıcı tarafından 16 Kasım 2026 tarihinde bildirildi; eski Belgeler dizini yerine C:\GitHub kullanılır.
- Paketler, kaynaklar ve public varlıklar frontend deposuna kopyalanır; `.env`, node_modules, dist, test ekran görüntüleri ve `.git` kopyalanmaz.
- Geniş UI değişikliklerini 390px ve 768px ile doğrula; mock API kontrollerini canlı backend testlerinden açıkça ayır.

## Küçük görevlerde kapsam

- Proje başka bir AI'a devredilmiyor. Ana geliştirme mevcut kullanıcı/Codex akışında sürer.
- Yardımcı AI yalnız kullanıcının belirttiği küçük, sınırları belli işi yapmalı; kendi başına yeniden tasarım, mimari göç veya geniş sürüm çalışması başlatmamalı.
- Güncel sürüm 0.7.0. UTR grafit/kırmızı kimliği ve rol denetimleri korunmalı.
- İlgili dosyalar için docs/ARCHITECTURE.md ve görsel görevde docs/VISUAL_BRIEF.md referanstır.

- Coin ve erken erişim kuralları sunucuda denetlenir; yalnız frontend kilidi yeterli değildir. 0.6.0 ve 0.7.0 migration gereklidir. İşlem referansları, nonnegative bakiye ve transaction/satır kilitleri korunmalı.

- 0.7.0: manage_coins yalnız kurucu/yardımcı kurucu; işlem referansı ve operatör kaydı korunur. Satın alma onayı zorunludur; otomatik iade yoktur. early_access_sales kalıcı rapor kaydıdır; satılmış proje silinmez. Toplu mail alıcı önizleme/onay ve tekrar korumasını atlama.

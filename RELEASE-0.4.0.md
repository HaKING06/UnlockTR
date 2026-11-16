# UnlockTR 0.4.0 — yayınlama notları

## Değişiklikler

- Oyun yayın stüdyosu: temel bilgiler, kapsam, mod türleri, indirme erişimi, kurulum ve uyumluluk notları, yayın özeti.
- Mod türleri: özel, ensest (18+), galeri kilidi, karakter/ilişki isimleri, seçim rehberi, oynanış kolaylığı, arayüz ve diğer. İsim/ilişki değişikliği seçimi kullanıcı isteği doğrultusunda ensest etiketini ve 18+ işaretini ekler. Mod kapatılırsa tür/not bilgisi kaydedilmez.
- Standart indirme yalnız reklamlı TRLink'tir ve yeni/güncellenen oyunlarda zorunludur. MediaFire ve Pixeldrain public API'den çıkarıldı; yalnız aktif VIP kontrolünden sonra alınır. URL alanları HTTPS ister; etiketin reklamlı/reklamsız doğruluğu yayınlayan tarafından doğrulanmalıdır. Harici sağlayıcının kendi hız/kota politikaları geçerlidir.
- VIP istekleri öncelikli sıraya alınır, kurucuya işlem e-postası kuyruğu oluşturulur. Öncelik teslim/yayın garantisi değildir. Mevcut VIP/ekip istekleri migration'da öncelikli işaretlenir; yeni isteklerde öncelik sunucuda hesaplanır.
- Üye /requests sayfasından tür/platform/resmî bağlantı ile istek gönderir, ekip yanıtını ve durumunu takip eder. Yönetim istek listesi VIP önce, her grupta eskiden yeniye sıralanır.
- Ret/hazırlık/inceleme/tamamlandı durumları e-posta bildirimi üretir. Boş yanıtlar duruma uygun varsayılan metin alır. Hazır yanıtlar: zaman yok, oyun kopyası yok, teknik uyumsuzluk ve olumlu hazırlık. Aynı durum/yanıt tekrar kaydedilirse e-posta tekrarlanmaz.
- Manuel VIP atama/kaldırma e-postası; atama zamanı, plan ve yeni bitişi içerir. Ekip rol değişikliği otomatik VIP durumunu da bildirir. Tarihler Türkiye saatinde gösterilir.
- Bildirimler iş işlemiyle aynı SQL statement içinde kalıcı outbox'a eklenir. Mail sağlayıcısı hatası VIP/istek değişikliğini kaybettirmez. Aktif Render sunucusu 30 saniyede bir kuyruğu işler; en fazla 5 deneme, üstel bekleme ve Resend idempotency anahtarı vardır. Uyuyan/durdurulan sunucuda kuyruk sonraki başlangıca kadar bekleyebilir.
- Kurucu Yönetim → E-posta kuyruğu bölümünde pending/sending/sent/dead durumunu görebilir ve dead olanı yeniden deneyebilir. Sent, sağlayıcının kabulüdür; gelen kutusuna ulaştığına ilişkin teslim webhook doğrulaması değildir.
- Buy Me a Coffee desteği /support ve ana navigasyona eklendi: https://buymeacoffee.com/haking . Gönüllü destek otomatik VIP oluşturmaz. VIP satışları hâlâ ItemSatış üzerinden; kurucu manuel atar. Fiyatlar 49 TL/ay ve 399 TL/yıl.
- Kod girişi altı kutulu; yapıştırma, sayısal klavye, otomatik doldurma ve ok/backspace desteği.
- Yeni kayıtlar yalnız gmail.com. Eski farklı domainli hesaplar giriş yapabilir. Bu kısıt sahte/çoklu hesapları tek başına tamamen engellemez.
- Hesap silme için şifre + e-postaya gönderilen, silme amacına bağlı 6 haneli kod + SİL onayı gerekir. Profil anonimleştirme davranışı korunur. Kurucu hesabı yine panelden silinemez.
- Kalıcı giriş: JWT belirteci localStorage'da, sunucuda hash'li rastgele session ID kaydı. 30 gün hareketsizlik veya en fazla 90 gün sonunda tekrar giriş gerekir. Her istekte DB oturumu, token sürümü ve rol kontrol edilir. Çıkış/şifre değişimi/sıfırlama/silme oturumları iptal eder. Cihazdaki token JS tarafından erişilebilir; mevcut ayrı-origin dağıtımda HttpOnly çerez kullanılmaz. Güçlü CSP korunur; bu bir güvenlik denetimi sertifikası değildir.
- Eski sessionStorage tokenları geçişte okunur; yeni kalıcı oturum için yayın sonrası bir kez çıkış/giriş gerekir. F5 ve tarayıcıyı kapatıp açmak yeni oturumu silmez. Ortak cihazda çıkış yap.
- Gerçek çerez tercih paneli: Kabul et, Sadece gerekli, Tercihler. Görünüm tercihleri izinle cihazda saklanır; oturum/güvenlik depolaması gerekli işlevdir. Karar unlocktr_consent çerezinde 180 gün saklanır; footer'dan değiştirilebilir. Analitik veya reklam takip kodu eklenmedi. /privacy teknik veri/depolama akışını açıklar; yasal uygunluk garantisi değildir.

## Neon

Migration 0.4.0 önce geçici production kopyasında iki kez çalıştırılarak sınandı; ardından canlı production/neondb üzerinde uygulandı. 3 kullanıcı, 1 oyun ve 0 istek korundu. Geçici branch kaldırıldı. Tekrar SQL çalıştırmana gerek yok. Yeni kurulumda npm run db:migrate tüm migration'ları sırayla uygular.

## Yayın sırası

1. C:\GitHub\UnlockTR-Backend → commit/push. Render otomatik deploy tamamlanınca /api/health sürümü 0.4.0 olmalı.
2. Render env değişmez: DATABASE_URL, RESEND_API_KEY, JWT_SECRET, FRONTEND_URL ve FOUNDER_EMAIL korunur. Ek anahtar/SMTP/ücretli servis gerekmez. Bildirim worker'ı aynı Node sürecinde başlar.
3. Sonra C:\GitHub\UnlockTR → commit/push ve Cloudflare build/deploy beklenir.
4. Bir kez çıkış/giriş yap. Gmail dışındaki eski hesaplar etkilenmez; yeni kayıtlar Gmail ister.
5. Bir oyun düzenleyerek mod türlerini ve reklamsız VIP bağlantılarını gözden geçir. Mevcut modlu oyunlara migration'da Özel etiketi verilir; detaylandırabilirsin.
6. VIP ataması yapıp kuyruk durumunu kontrol et. Bir VIP oyun isteği, ardından hazırlık/ret şablonu ile gerçek e-posta akışını dene. Bu test için ödeme yapmana gerek yok.

## Kontrol ve sınırlar

Backend 12 test: OTP, Gmail kısıtı, ayrı amaçlı silme kodu, rol/VIP izinleri, mod etiketleri ve 18+, gizli indirmeler, öncelikli istekler, varsayılan yanıt/dedup, bildirim hatası/retry/idempotency, kalıcı/iptal edilen oturumlar. PGlite ve sahte gönderici kullanılır.

Frontend build + biçim kontrolü ve Playwright 390px/768px: mod paneli, 18+ otomatik seçim, standart/VIP ayrımı, istek/şablon ekranı, altı kod kutusu, kalıcı token/F5, destek bağlantısı ve çerez kararı. Yatay taşma yok. API yanıtları mock edildi; gerçek yeni e-postaların teslimi Render deploy sonrası sınanmalıdır. Neon migration gerçek ortamda doğrulandı. Google indeks/sitelinks, harici indirme hızı ve e-posta gelen kutusu yerleşimi garanti edilmez.

Rate limit tek instance belleğinde, OTP sınırları DB'dedir. Outbox SKIP LOCKED ile birden fazla worker'a uygundur. Sunucunun sürekli aktif olmadığı planlarda zamanında bildirim için plan/worker sürekliliği ayrıca değerlendirilmelidir. Harici VIP URL'lerinin kullanıcılar tarafından paylaşılmasını engelleyen DRM yoktur.

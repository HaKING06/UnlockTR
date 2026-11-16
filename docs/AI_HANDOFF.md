# UnlockTR · AI devralma özeti

> Kod sürümü **0.4.0**. Bu belge görsel/teknik yardım için başlangıç noktasıdır; yeni bir proje kurma talimatı değildir.

## 60 saniyelik bağlam

UnlockTR, Türkçe oyun yamaları ve modları sunan bir platformdur. Site `https://unlocktr.haking.tr`, API `https://unlocktr-backend.onrender.com/api` adresini kullanır. Frontend React 19 + Vite 7 + Lucide + düz CSS; backend Express 5 + pg + Zod + bcrypt + JWT. Veritabanı Neon PostgreSQL, e-posta Resend. Frontend Cloudflare Workers Static Assets ile dağıtılır; ayrı backend Render'dadır.

## Depolar ve çalışma konumu

| İçerik | GitHub | Yerel checkout |
|---|---|---|
| Frontend | HaKING06/UnlockTR | `C:\GitHub\UnlockTR` |
| Backend | HaKING06/UnlockTR-Backend | `C:\GitHub\UnlockTR-Backend` |

Geliştirme kopyaları `C:\Users\halit\Desktop\WEB\UnlockTR\frontend` ve `...\backend` altındadır. İki bağımsız GitHub deposunda uygulama dosyaları doğrudan köktedir; deploy Root Directory alanı boştur. Hangisinin güncel olduğunu Git durumuyla kontrol et. `.git`, `.env`, node_modules, dist ve test ekran görüntülerini diğer kopyaya taşıma.

## Şu anki ürün

- Herkes katalog/oyun sayfasını görür; standart indirme reklamlı TRLink'tir.
- Pixeldrain/MediaFire yalnız aktif VIP kontrolü sonrası sunucudan alınır; public katalogda URL bulunmaz.
- Ren'Py ve Unity desteklenir. Mod türleri ve kapsamı, kurulum ve uyumluluk notları vardır.
- Yeni üyelikler gmail.com ister. E-postadaki altı haneli kod doğrulanınca otomatik giriş yapılır.
- Kurucu FOUNDER_EMAIL ile belirlenir ve doğrulanmış hesabı kullanır; eski admin-secret girişi yoktur.
- Kurucu tüm yetkilere sahiptir. Yardımcı kurucu oyun ve yorum yönetir. Moderatör yorum yönetir, oyun yayınlayamaz. Kurucu ve ekip otomatik VIP alır.
- VIP 49 TL/ay ve 399 TL/yıl olarak sunulur. Satış ItemSatış'ta, etkinleştirme kurucu tarafından manueldir; ödeme entegrasyonu/otomatik abonelik yoktur.
- VIP istekleri öncelikli sıralanır ve kurucuya e-posta bildirimi oluşturur; yayın/teslim garantisi verilmez.
- Ret/hazırlık/diğer durumlar ve VIP atamaları kalıcı notification_outbox üzerinden işlem e-postası üretir. Kuyruk durumları kurucuya açıktır.
- Hesap silme şifre + silme amacına bağlı e-posta kodu + SİL onayı ister. Profil anonimleştirilir; yorumlar anonim kalır. Kurucu hesabı panelden silinmez.
- Giriş localStorage + sunucuda hash'li session ID kaydı kullanır. 30 gün hareketsizlik / 90 gün üst sınır; iptal ve rol kontrolleri her istektedir. HttpOnly cookie oturumu kullanılmaz.
- NSFW tercihleri üye hesabında, izin verilirse misafir cihazında hatırlanır. Çerez paneli gerçek tercih saklamayı yönetir; analitik/reklam takip kodu yoktur.

## Değiştirmeden koru

1. UI'da butonu saklamak yetki kontrolü değildir; backend izinlerini kaldırma.
2. VIP URL'lerini public yanıtlara, HTML'e veya loglara ekleme.
3. Kodları/şifreleri/tokenları/e-posta anahtarlarını loglama. `.env.example` yalnız örnek değerler içersin.
4. Canlı Neon'da reset/drop/seed yapma. Migration'ı önce geçici branch veya test DB'de dene; kullanıcı/oyun kayıtlarını koru.
5. Workers'ta `/* /index.html 200` kuralını geri getirme. Bu yapı daha önce build döngüsü ve /verify yol kaybı oluşturdu.
6. Oyun adresi `/game?id=UUID`; sabit sayfalar build'de gerçek HTML girişleri alır. Yeni route eklenirse vite.config.js güncellenmeli.
7. Sadece görsel görevde API sözleşmesini ve backend'i değiştirme. Mevcut fiyat/rol/ödeme kararlarını kendiliğinden yeniden tasarlama.
8. Sahte oyun/yorum verisini canlıya veya ürün kaynaklarına koyma.
9. Bu doküman/afiş tesliminde sürüm 0.4.0 korunmuştur. Kullanıcı sürümü sabit tutmanı isterse buna uy.

## İlk okumalar

[Architecture](ARCHITECTURE.md) → [Visual brief](VISUAL_BRIEF.md) → [Validation](VALIDATION.md) → [Next AI prompt](NEXT_AI_PROMPT.md). Son iş özeti: [Maintenance notes](MAINTENANCE_NOTES.md). Repo kökündeki AGENTS.md de geçerlidir.

## Doğrulama sınırı

Son kod tesliminde 12 backend testi ve 390px/768px mock Playwright kontrolleri geçti; Neon 0.4.0 migration'ı veri kaybı olmadan uygulandı. Bu, güncel canlı deploy'un veya tüm Resend teslimlerinin bugün doğrulandığı anlamına gelmez. Kod sürümü ile canlı health sürümünü ayır. Açık kaynak lisansı seçilmemiştir; LICENSE hakları saklı tutar.

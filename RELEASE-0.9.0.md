# UTRZONE 0.9.0 · 17 Kasım 2026

Arayüz bakımı, çoklu görseller, proje görünürlüğü ve bağlantı sürekliliği.

## Oyuncu deneyimi

- Açılır listeler Radix Select ile site tasarımına uyarlanır; klavye/odak, yön tuşları, Escape, seçili durum ve portal yerleşimi desteklenir. Motor, istek durumu, yanıt şablonu, üye rolü ve rapor sıralaması aynı bileşeni kullanır.
- Site işletim sistemi temasından bağımsız dark başlar. Kullanıcı light seçerse görünüm değişir; tercih izni varsa cihazda hatırlanır. Bu varsayılan mevcut kodda da dark idi; OS light ile tarayıcıda doğrulandı.
- Şeffaf WebP marka varlıkları ve e-posta PNG'si hazırlandı; light moddaki eski siyah logo zemini kuralı kaldırıldı. Yerleşik imagegen ile arka plan düzenlemesi yapıldı; prompt ve kaynak notları public/brand/README.md içinde.
- İstek kartındaki + simgesi kaldırıldı. Yönetim hızlı eylemleri daha küçük ve bir arada; giriş görseli kendi bölmesinde, yeniden dengelenmiş konum/oranla sunulur.
- Kapak dışında en fazla 12 HTTPS görseli eklenebilir. Galeri, küçük resimler ve tam boyut görüntüleyici; klavyeyle önceki/sonraki, Escape ile kapatma. +18 tercihi hem ana görsele hem küçük resimlere uygulanır.
- Detay görseli kırpılmaz ve doğal piksel genişliğinin üstüne zorlanmaz. 192px test görseli 192px çizildi. Düşük çözünürlüklü kaynakta kaybolan ayrıntı geri üretildiği iddia edilmez; editör yüksek çözünürlüklü kaynak önerir.

## Yönetim ve güvenlik

- Proje formunda Yayında/Gizli seçimi. Gizli proje public katalog, detay, favoriler, indirme, erken erişim ve yorum akışlarında sunulmaz; yetkili editör erişir. Gizleme bir satın alma iadesi değildir.
- Özel raporlar Hepsi/Yayında/Gizli/Erken erişim/Kaldırılanlar filtreleri ve güncelleme/coin/alıcı/indirme/favori sıralaması içerir. Yayında filtresi aktif erken erişim projelerini de içerir. Filtre/sıralama sunucuda whitelist ile denetlenir; tüm katalogda sayfalama korunur.
- Yetkili yorum silme hem oyun sayfasında hem yönetimde site içi onayla kalıcıdır. API onayı ve moderate_comments izni zorunlu; yorum metni silinir, içeriği taşımayan audit kaydı aynı transaction içinde tutulur. Eski gizle/göster desteği yönetimde korunur.
- Gizli projeler için yeni sürüm bildirimi oluşturulmaz; bekleyen proje bildirimleri iptal edilir. Coin, satın alma ve satılmış proje kaldırma kuralları değiştirilmedi.

## Render sağlık isteği

Sayfa açılışında sağlık kontrolü yapılır; site açıkken 5 dakikalık aralıkla yeniden denenir. Sekmeler son kontrol zamanını paylaşır; yakın zamanda diğer sekme istek gönderdiyse tekrar bastırılır. İnternet geri geldiğinde ve sayfa yeniden görünür olduğunda uygun aralık kontrolüyle tekrar denenir. Aynı anda ikinci soğuk başlangıç isteği başlatılmaz; 90 saniye timeout ve credentials omit kullanılır. Build VITE_API_URL adresini üretim betiğine uygular; yerel geliştirme localhost API'ye gider.

Arka plan sekmesi/cihaz askıya alınırsa tarayıcı zamanlayıcıları gecikebilir. Bu mekanizma ücretsiz Render'da sürekli uyanıklık SLA'sı değildir; ziyaretçi yokken harici bot/cron çalıştırmaz. Çalışma saati tüketimi artabilir. Render ücretsiz servisleri 15 dakika trafik gelmeyince uyutabilir; çalışma saati ve diğer plan limitleri geçerlidir. Resmî kaynak: https://render.com/docs/free

## Şema ve yayın

migrations/0.9.0.sql gallery_images ve is_hidden ekler; görsel sayısı DB'de de sınırlıdır. Test dalında iki kez ve geri alınan gizlilik/galeri denemesiyle doğrulandı; sonra Neon production'a uygulandı. Mevcut hesaplar, oyunlar, yorumlar, bakiyeler ve satışlar değişmedi. Gerçek oyun gizlenmedi veya gerçek yorum silinmedi. Geçici test dalı kaldırılır.

Yeni ortam değişkeni yok. Önce C:\GitHub\UnlockTR-Backend push ve Render 0.9.0 sağlık kontrolü, sonra C:\GitHub\UnlockTR frontend push/Cloudflare build. Yeni schema kurulumunda npm run db:migrate tüm migration'ları uygular. Görsel deposunda yeni /brand/utrzone-v090 paketi bulunur; eski sürümlü paketler mevcut bağlantıları kırmamak için tutulur. Klasör/remote/API hostname'leri değişmedi. Bu teslim commit/push/deploy veya Render ayar değişikliği yapmaz.

## Doğrulama

34 backend PGlite/Supertest testi: yeni gizli erişim yolları, galeri HTTPS/sayı/tekrar doğrulaması, tüm rapor filtreleri/sıralama whitelist'i, kalıcı yorum silme yetkisi/onayı/audit dahil. 3 frontend Node VM testi: ilk sağlık isteği, 5 dakika aralığı, tek kurulum, sekmeler arası tekrar önleme, offline toparlanma ve bekleyen istek çakışması. VM testleri gerçek 5 dakika bekleme değildir.

Production build/format geçti. Playwright 390/768px: OS light ile dark varsayılan, manuel light/dark, logo zemini, motor menüsü ve klavye seçimi, istek durumu/hazır yanıt, galeri/küçük resim/tam boyut/Escape, görsel ekleyip kaydetme, özel rapor filtreleri, yorum silme onayı, yönetim ve giriş ekranı. Yatay taşma görülmedi. Yerel gerçek Express + izole PGlite; harici test görselleri yerel fixture ile karşılandı. Canlı e-posta/ödeme/ziyaretçi hesabına yıkıcı işlem yok. Bu bir yük testi veya bağımsız güvenlik denetimi değildir.

## Sonraki geliştirme adayları

1. Oyun bazlı sürüm geçmişi, dosya boyutu/SHA-256 ve kurulum kontrol listesi.
2. Sürüm ve cihaz bilgisi isteyen sorun bildirim sistemi; ekip durum takibi ve bilinen sorunlar.
3. Takip edilen oyunlar için site içi bildirim kutusu; e-postaya bağımlı olmayan güncelleme akışı.

## Üretim CSP kontrolü

Radix Select 2.4.1 ve react-remove-scroll çalışma anında style öğeleri ekler. Gerçek _headers politikasıyla production build menüsünü açarken bu öğeler engellendiği doğrulandı. Düzeltme: style-src-elem için self/unsafe-inline izni, style-src-attr none. Script-src self, object-src none ve diğer korumalar değişmedi. Statik dağıtımda istek bazlı nonce üretimi eklenmedi; yalnız stil öğelerine uygulanan bu izin güvenlik politikası değerlendirmesinde dikkate alınmalıdır. Kütüphane değişirse CSP kontrolü tekrarlanmalı. Kaynak: https://github.com/radix-ui/primitives/discussions/3130

Düzeltme sonrası derlenmiş üretim dosyaları, gerçek CSP ve yerel API adresiyle 390/768px menü/seçim/Escape kontrolü: sıfır konsol hatası, yatay taşma yok. Son dağıtım çıktısı tekrar normal üretim API adresiyle üretildi.

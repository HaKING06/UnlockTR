# UTRZONE 0.7.0 · 17 Kasım 2026

Coin yönetimi, proje raporları, favoriler ve izinli iletişim araçları.

## Oyuncu deneyimi

- Tarayıcı confirm kutuları yerine klavyeyle kullanılabilen, Escape ile kapanan site içi onay pencereleri. Kaydedilmemiş formdan ayrılma uyarısı tarayıcının kendi beforeunload mekanizmasını kullanır.
- Erken erişim satın alma öncesinde tutar ve koşullar gösterilir; işaretlenmeden satın alma tamamlanamaz. Otomatik uygulama içi coin iadesi yoktur; kanuni haklar saklıdır. Onay zamanı ve politika sürümü kaydedilir.
- Favori listesi ve herkese açık favori sayıları. Standart hesap 100, VIP/ekip 1000 favori saklayabilir. VIP süresi bittiğinde var olan liste silinmez; kapasite üstünde yeni ekleme sınırlandırılır.
- VIP'nin favorilerindeki oyun sürümü değişince isteğe bağlı e-posta bildirimi. Yalnız açıklama değişikliğinde bildirim gönderilmez. VIP günlük ödül çarpanı ve erken erişim indirimleri korunur.
- Hesapta duyuru ve favori güncelleme bildirim tercihleri. Gönderim sırasında tercihler yeniden denetlenir.
- Oyunların eklenme ve son güncelleme günleri gösterilir. Tarih backend tarafından kaydedilir; kullanıcıya gün/ay/yıl sunulur.
- Daha sıkı kırmızı/grafit görsel düzen, mobil hesap menüsü, okunabilir işlem geçmişi ve özel rapor kartları.

## Ekip araçları

- Coin yükleme yalnız kurucu ve yardımcı kurucuya açık. Tutar, gerekçe, alıcı ve onay akışı; aynı işlem referansı ikinci kez bakiye eklemez.
- Sayfalı/aranabilir coin yükleme geçmişi: işlemi yapan kişinin adı, rolü ve mevcut hesabının e-postası. Yeni işlemlerde rol/ad işlem anında saklanır; eski kayıtlar mevcut hesaptan çözümlenir. Hesap silinince kişisel operatör bilgisi anonimleştirilir.
- Kurucu/yardımcı kurucu özel proje raporları: satın alan kişi sayısı, harcanan coin, satın alırken VIP olan kişi sayısı, favoriler ve indirme bağlantısı açılışları. Eski satın alımların VIP durumu bilinmiyorsa uydurulmaz.
- Satış kayıtları hesap silinse bile kullanıcı bağlantısı kaldırılarak korunur. Satın alınmış projenin silinmesi engellenir; mevcut erişimler otomatik iadeyle kaldırılmaz.
- Kurumsal e-postada tek alıcı / moderatörler / tüm uygun üyeler seçimi. Toplu duyuru yalnız doğrulanmış, aktif ve duyuru tercihi açık hesaplara gider. Gönderim öncesi sayı ve alıcı kümesi denetlenir; aynı taslak tekrarında çift gönderim oluşmaz.
- Her alıcı ayrı kuyruk kaydıyla gönderilir; adresler toplu CC/BCC listesinde paylaşılmaz. Tek kampanya en fazla 5000 alıcı, mevcut gönderim limiti 20 istek/saat. Resend limitleri ve uyuyan backend teslimi geciktirebilir. Kuyruğa alınma inbox teslim kanıtı değildir.

## Ölçümlerin anlamı

İndirme sayısı dosyanın tamamlandığını değil, yetkisi doğrulanan harici bağlantının açılışını ölçer. Aynı ziyaretçi/sağlayıcı/oyun/gün tekrarları tekilleştirilir; ham IP veritabanına yazılmaz. Harici URL paylaşımını önleyen DRM yoktur. Favoriler gerçek hesap işlemlerinden gelir; başarı veya kalite garantisi değildir.

## Şema ve yayın

- `migrations/0.7.0.sql`: tercihler, favorites, download_events, mail_batches, kalıcı early_access_sales ve işlem operatörü alanları. Tekrar uygulanabilir; önceki migration'lar korunur.
- Eski backend ile geçiş sırasında yapılan satın alımların raporlara girmesi için game_unlocks ekleme trigger'ı bulunur. Eski onaylar varmış gibi üretilmez.
- Migration Neon test dalında iki kez ve geri alınan bir eski sürüm satın alma denemesiyle doğrulandı. Ardından production'a uygulandı; 2 hesap, 1 oyun, 1 yorum, 2 cüzdan, 5 ledger ve 1 satın alma kaydı değişmeden korundu.
- Yeni ortam değişkeni gerekmiyor. Kod henüz push/deploy edilmedi. Önce backend deposunu push edip Render yayınının sağlıklı olduğunu doğrula; ardından frontend deposunu push et. Yeni kurulumlarda `npm run db:migrate` bütün geçişleri sırayla uygular.

## Doğrulama ve sınırlar

29 PGlite/Supertest testi geçti; yetkiler, satın alma onayı, çift işlem koruması, anonim raporlar, favoriler, indirme izinleri, e-posta alıcı onayı/tercihleri sınandı. Frontend build ve format kontrolü geçti. Playwright 390/768 px: gerçek yerel Express + izole PGlite üzerinde giriş, coin ekleme, onay pencereleri, favori, satın alma, özel raporlar, mail önizlemesi ve tema/menü kontrolü. Harici indirme sayfası test içeriğiyle karşılandı; gerçek ödeme veya e-posta gönderilmedi. Bu çalışma yük testi, bağımsız güvenlik denetimi veya hukuki uygunluk sertifikası değildir.

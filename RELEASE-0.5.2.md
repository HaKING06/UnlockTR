# UTRZONE 0.5.2 · Kullanılabilirlik ve büyüyen katalog

## Düzeltilen hatalar
- Üst çubuğun backdrop-filter katmanı nedeniyle hesap menüsünün hero/cam paneller arkasında kalması: header için konumlu bağımsız üst katman. Menü dış tıklama ve Escape ile kapanır; uzun menü dar ekranda kaydırılır.
- Motor ve yama/mod filtrelerinin yalnız yüklenmiş ilk sayfada çalışması: filtreler API sorgusuna taşındı. Filtre değişince sayfa sıfırlanır; filtreli sonuç varsayılan katalog önbelleğini kirletmez.
- Aynı aramanın yeniden gönderilmesinde listenin boş kalması ve tekrarlanan filtre seçiminde temizlenmesi düzeltildi. Ek sayfalarda ID üzerinden tekrarlar ayıklanır.
- Kamuya açık katalog ve admin oyun listesinde son sayfa bir ek kayıt ile kontrol edilir; tam dolu son sayfada gereksiz devam düğmesi gösterilmez. Sıralama created_at + id ile kararlıdır.
- Profil kaydından sonra ikinci içerik-tercihi isteğinin eski görünen adı geri yazması düzeltildi. Profil ve NSFW durumu tek yanıtla eşitlenir.
- JSON olmayan geçici sunucu yanıtları kullanıcıya anlaşılır Türkçe hata verir.
- Geçerli uzun Türkçe açıklamaların 32 KB istek sınırına takılması düzeltildi: sınırlı JSON gövdesi üst sınırı 128 KB; alan sınırları ve tüm yetki denetimleri korunur.

## Yayın stüdyosu
Kapak önizlemesi (18+ korumasıyla), görsel hata durumu ve yayın kontrol listesi eklendi. Düzenleme yüklenemezse tekrar deneme bulunur. Kaydedilmemiş değişiklikler listeye dönüşte, yönetim sekmesi değişiminde ve tarayıcıdan ayrılırken uyarılır. Taslaklar özel indirme URL'lerini cihazda saklamamak için localStorage'a yazılmaz.

## Katalog büyümesi
Filtreler tüm veritabanını kapsar. Her yanıt en fazla 24 oyun döndürür; kart açıklamaları 280 karakterle ve yalnız kartta gerekli alanlarla sınırlıdır. Tam açıklama oyun detay sayfasında korunur. Bu, sınırsız ölçek garantisi veya milyonlarca satır performans ölçümü değildir; mevcut offset sayfalama ileride gerçek trafik ölçümlerine göre cursor/trigram aramaya taşınabilir.

## Doğrulama
- Frontend production build ve format:check başarılı.
- Backend 15 test: PGlite veritabanı / sahte e-posta göndericisi. Yeni testler 26 oyunla tüm katalog filtresi, 24+2 sayfalama, son sayfa, kısa liste açıklaması ve uzun Türkçe açıklamayı kapsar.
- Playwright MCP yalnız 390px ve 768px; mock API. Menü katmanına hit-test, dış tıklama/Escape, yatay taşma, oyun formu, değişiklik uyarısı, aynı aramayı yineleme, 48 kart sayfalama, tek profil PATCH'i ve yükleme hatasından kurtarma kontrol edildi.
- Canlı Render/Neon/Resend üzerinde veri değiştirilmedi. Canlı performans veya gerçek e-posta teslimi bu kontrollerin parçası değildir.

## Yayın sırası
Önce UTRZONE-Backend push / Render deploy, ardından UTRZONE frontend push / Cloudflare build. API filtre desteği için backend'in güncellenmesi gerekir. Yeni environment değişkeni veya SQL migration yoktur. Mevcut 0.4.0 migration önkoşulu devam eder. Commit/push/deploy bu teslimde yapılmadı.

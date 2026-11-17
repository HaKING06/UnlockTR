# Görsel iyileştirme brief'i

## Amaç

UTRZONE'yi profesyonel bir oyun yama/mod platformu olarak geliştirmek. Steam/Nexus tarzı güçlü hiyerarşiden ilham alınabilir; başka sitenin markasını, kodunu veya görsellerini kopyalama. Mevcut uygulamayı iyileştir, sıfırdan başka bir ürün kurma.

## Korunacak kimlik

- Grafit #111111 yüzeyler, kan kırmızısı #dc2626 vurgular, metalik gümüş UTR markası; VIP için ölçülü altın.
- Sinematik portal görseli, kontrollü ışık, okunabilir tipografi, geniş fakat işlevsel boşluklar.
- Dark varsayılan, light destekli. Renkler src/style.css içindeki CSS değişkenlerinden yönetilir.
- Türkçe arayüz ve doğru Türkçe karakterler. Sahte istatistik, geri sayım veya gerçek olmayan yorum ekleme.
- Lucide ikonları; sırf moda olduğu için Tailwind/UI kütüphanesi göçü yapma. Yeni bağımlılık ancak somut ihtiyaçla eklenmeli.

## İyileştirme alanları

1. Vitrin ve katalog: güçlü görsel hiyerarşi, kart/durum tutarlılığı, boş/yükleniyor/hata görünümü.
2. Yayın stüdyosu: dört bölüm, dinamik mod paneli, açık standart/VIP ayrımı, görünür kayıt geri bildirimi.
3. Oyun sayfası: indirme merkezi, kurulum rehberi, mod kapsamı ve yorumların dengesi.
4. Üyelik: altı kod kutusu, otomatik doldurma, görünür hata, doğru odak ve kolay geri dönüş.
5. Hesap/yönetim: anlaşılır roller, güvenli silme onayı, VIP/istek durumu ve bildirim kuyruğu.
6. VIP sunumu: gerçek avantajları anlat; teslim garantisi, sahte kıtlık veya aldatıcı tercih tasarımı ekleme.

## Etkileşim kuralları

- Oyunlar popup değil /game?id=UUID sayfasında açılır. Yetkililer Bu projeyi düzenle bağlantısını görür.
- Standart kullanıcı reklamlı indirmeyi görür; özel URL'ler API kontrolünden önce görünmez.
- Çerez Kabul et tek tıkla kapanır; Sadece gerekli ve sonradan tercih değiştirme çalışır. Yeni analitik ekleme.
- Hesap silme, e-posta kodu ve şifre gerektirir. Güvenlik adımlarını görsellik için kaldırma.
- NSFW bulanıklığı, açık/koyu tema ve prefers-reduced-motion korunur.
- Yeni sabit yol eklenirse Vite HTML girişi ve uygun metadata ekle; catch-all rewrite geri gelmemeli.

## Teslim ölçütleri

390px ve 768px: yatay taşma yok; odak belirgin; düğmeler erişilebilir; form etiketleri anlamlı; klavyeyle OTP/yapıştırma çalışır; dark/light okunabilir. UI testlerinde mock ile gerçek API'yi raporda ayır. Sadece metin/renk değişiminde gereksiz browser/test çalıştırma.

## Görseller

README afişleri docs/media içindedir; bunlar ürünün gerçek ekran görüntüsü değildir ve mevcut public/images/utr-world.webp dosyasından ayrı tanıtım varlıklarıdır. Yeni görsellerde telifli oyun karakterleri, doğrulanmamış hizmet vaatleri ve sürüm/fiyat gibi hızla eskiyen metinlerden kaçın.

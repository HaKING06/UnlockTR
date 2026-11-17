# 0.5.0 kontrol kaydı

- Frontend format:check ve production build başarılı.
- Backend 13 test PGlite veritabanında ve sahte e-posta göndericisiyle başarılı.
- Playwright MCP, yalnız 390px / 768px: katalog, giriş ekranı, oyun sayfası, istek yönetimi ve posta stüdyosunda yatay taşma görülmedi.
- Mock API ile: giriş sonrası /, açık oturumun /login ekranını atlaması, footer hesap bağlantısı, yetkili yorum düzenleme, reviewing hazır yanıt/önizleme, pending şablonu, posta formu onayı ve gönderimi, moderatörün posta ekranına erişememesi.
- Mock API kesintisinde önbellekteki katalog gösterildi. 18+ gösterme ve açık tema düğmeleri çalıştırıldı.
- E-posta logosu yerel SVG'den PNG olarak render edilip görsel kontrol edildi. İki tanıtım afişinin metinleri ve marka renkleri kontrol edildi.
- Canlı Render/Resend performansı veya teslimi ölçülmedi. Canlı kullanıcı verisi değiştirilmedi. Gerçek alıcıya e-posta gönderilmedi.

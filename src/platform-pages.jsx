import React from "react";
import {
  ArrowUpRight,
  BookOpen,
  Mail,
  Megaphone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "./ui";

const email = "utrzone@haking.tr";
const proposal =
  "mailto:" +
  email +
  "?subject=" +
  encodeURIComponent("UTRZONE · Reklam ve iş birliği") +
  "&body=" +
  encodeURIComponent(
    "Marka / proje:\nWeb sitesi:\nİş birliği türü:\nHedef kitle ve ülke:\nPlanlanan dönem:\nBütçe aralığı:\nTeklif detayları:\n",
  );

export function AboutPage() {
  return (
    <section className="institution-page">
      <PageHeader
        eyebrow="HİKÂYEMİZ"
        title="Daha çok hikâye. Kendi dilinde."
        description="UTRZONE, oyunları Türkçe deneyimlemek ve modlarla yeniden keşfetmek isteyen oyuncular için bağımsız bir platform."
      />
      <div className="about-feature panel">
        <div className="about-emblem">
          <img src="/brand/mark.webp" alt="UTR" />
          <span>
            UNDERGROUND
            <br />
            TRANSLATION & REWORKS
          </span>
        </div>
        <div>
          <span className="eyebrow">İSMİMİZİN ARDINDAKİ FİKİR</span>
          <h2>UTR ne demek?</h2>
          <p>
            <strong>Underground Translation & Reworks</strong> — Türkçesiyle{" "}
            <strong>Yeraltı Çeviri & Yeniden Yapımlar</strong>. UTRZONE adı,
            çeviri ve yeniden düzenleme çalışmalarını aynı oyuncu topluluğunda
            buluşturuyor.
          </p>
          <p>
            Amacımız; Türkçe yamaları, oyun modlarını ve kurulum bilgilerini
            anlaşılır, düzenli ve kolay keşfedilen bir kütüphanede sunmak.
          </p>
          <div className="founder-signature">
            <span>HALİT · HaKING06</span>
            <small>Kurucu</small>
          </div>
        </div>
      </div>
      <div className="institution-grid">
        <article className="panel">
          <BookOpen size={22} />
          <h2>Oyunların yanında, oyuncunun tarafında.</h2>
          <p>
            Ren’Py ve Unity oyunlarına yönelik çeviri ve mod çalışmalarına
            odaklanıyoruz. Her projede desteklenen sürümü, içeriği ve kurulum
            notlarını açıkça paylaşmayı önemsiyoruz.
          </p>
          <a className="text-button" href="/#library">
            Kütüphaneyi keşfet <ArrowUpRight size={15} />
          </a>
        </article>
        <article className="panel">
          <Sparkles size={22} />
          <h2>Birlikte şekillenen bir kütüphane.</h2>
          <p>
            Oyun istekleri, yorumlar ve geri bildirimler bir sonraki adımımıza
            yön veriyor. VIP ve gönüllü destekler platformun
            sürdürülebilirliğine katkı sağlıyor.
          </p>
          <a className="text-button" href="/requests">
            Oyun isteği paylaş <ArrowUpRight size={15} />
          </a>
        </article>
      </div>
      <div className="institution-note">
        <ShieldCheck size={20} />
        <p>
          Yetişkin içerikler 18+ olarak işaretlenir ve kapaklar varsayılan
          olarak gizlenir. UTRZONE bağımsızdır; oyunların ve markaların hakları
          ilgili sahiplerine aittir.
        </p>
      </div>
    </section>
  );
}

export function AdvertisePage() {
  return (
    <section className="institution-page">
      <PageHeader
        eyebrow="REKLAM & İŞ BİRLİĞİ"
        title="Doğru toplulukla buluşalım."
        description="Oyun, dijital araç ve içerik projeleri için UTRZONE ile sürdürülebilir iş birlikleri geliştirelim."
      />
      <div className="advertise-intro panel">
        <div>
          <Megaphone size={30} />
          <h2>Görünürlükten fazlası: uyum.</h2>
          <p>
            Türkçe yama ve modlarla ilgilenen bir oyuncu topluluğuna hitap
            ediyoruz. Marka, içerik ve hedef kitle uyumunu birlikte
            değerlendirerek yayın planı oluşturuyoruz.
          </p>
          <p>
            Platformda 18+ olarak işaretlenmiş içerikler de bulunur.
            Başvurularda bu yayın yapısı ve kampanyanın hedef kitlesi dikkate
            alınır.
          </p>
        </div>
        <aside className="proposal-box">
          <span className="eyebrow">BİRLİKTE PLANLAYALIM</span>
          <h3>Projenizi anlatın.</h3>
          <p>
            Marka, hedef ülke, dönem, yerleşim tercihi ve bütçe aralığınızı
            paylaşın.
          </p>
          <a className="primary" href={proposal}>
            <Mail size={16} /> İş birliği teklifi gönder
          </a>
          <small>E-posta uygulamanız açılır. {email}</small>
        </aside>
      </div>
      <div className="institution-grid ad-options">
        {[
          [
            "01",
            "Görsel reklam",
            "Kataloğa veya proje sayfalarına uyumlu, mobilde de düzenini koruyan banner yerleşimleri.",
          ],
          [
            "02",
            "Sponsorlu tanıtım",
            "Markanızı ve ürününüzü açık sponsor etiketiyle tanıtan içerik çalışmaları.",
          ],
          [
            "03",
            "Satış ortaklığı",
            "Uygun oyun ve dijital hizmetler için koşulları önceden belirlenen performans odaklı iş birlikleri.",
          ],
        ].map(([n, title, text]) => (
          <article className="panel" key={n}>
            <span className="ad-number">{n}</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <section className="panel institution-prose">
        <h2>Yayın ilkelerimiz</h2>
        <ul>
          <li>
            Reklam ve sponsorlu içerikler kullanıcı tarafından ayırt edilebilir
            biçimde etiketlenir.
          </li>
          <li>
            Sahte indirme düğmeleri, yanıltıcı yönlendirmeler ve zararlı yazılım
            içeren teklifler kabul edilmez.
          </li>
          <li>
            Yasa dışı içerikler, çocukları cinselleştiren materyaller ve gerçek
            kişilere yönelik izinsiz cinsel içerikler kabul edilmez.
          </li>
          <li>
            Yerleşim, süre, ücret ve ölçüm yöntemi yayın öncesinde karşılıklı
            olarak belirlenir.
          </li>
        </ul>
        <p>
          Şu anda bu sayfa üzerinden iş birliği talepleri alıyoruz; otomatik
          reklam ağı veya takip kodu çalıştırmıyoruz.
        </p>
      </section>
    </section>
  );
}

const help = [
  [
    "Yama mı indiriyorum, oyunun tamamını mı?",
    "Her projenin açıklamasındaki içerik ve kurulum notlarını kontrol et. Yama veya mod, desteklenen oyun sürümünü gerektirebilir; bir yama kaydı oyunun tamamının sunulduğu anlamına gelmez.",
  ],
  [
    "Hangi sürümü kullanmalıyım?",
    "Proje sayfasında belirtilen desteklenen sürümü esas al. Güncelleme öncesinde kayıtlarını yedekle; kurulum ve uyumluluk notlarını takip et.",
  ],
  [
    "Görseller ve içerik filtresi nasıl çalışıyor?",
    "18+ kapaklar başlangıçta gizlidir. Reşit kullanıcılar görünürlüğü üst menüden veya hesap ayarlarından değiştirebilir. Galeride otomatik slaytı duraklatabilir, oklarla gezebilir ve görseli tam boyutta açabilirsin.",
  ],
  [
    "VIP ve UCoin aynı şey mi?",
    "Hayır. VIP süreli bir üyelik; UCoin ise platform içi bakiyedir. VIP erken erişim projelerini otomatik açmaz; proje sayfasında gösterilen VIP coin fiyatı geçerlidir. VIP ve coin alımları ItemSatış üzerinden yürütülür, hesap tanımlamaları ekip tarafından yapılır.",
  ],
  [
    "İndirme bağlantısı çalışmıyorsa ne yapmalıyım?",
    "Oyun adını, seçtiğin sağlayıcıyı ve gördüğün hatayı destek ekibine gönder. Şifreni veya doğrulama kodunu paylaşma. Harici dosyaların barındırıldığı hizmetler zaman zaman erişilemeyebilir.",
  ],
  [
    "Yeni oyun veya özellik isteyebilir miyim?",
    "Doğrulanmış hesabınla oyun isteği oluşturabilirsin. Özellik fikirleri ve hata bildirimleri için Destek & İletişim sayfasından bize ulaşabilirsin. Bir istek oluşturmak tamamlanma sözü anlamına gelmez.",
  ],
];
export function HelpPage() {
  return (
    <section className="institution-page">
      <PageHeader
        eyebrow="YARDIM MERKEZİ"
        title="Oyuna dönmene yardımcı olalım."
        description="Yamalar, hesabın ve indirmelerle ilgili kısa yanıtlar."
      />
      <div className="help-list">
        {help.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
      <div className="institution-note">
        <Mail size={20} />
        <p>
          Yanıtını bulamadın mı? <a href="/support">Destek ekibine yaz.</a>
        </p>
      </div>
    </section>
  );
}

export function TermsPage() {
  return (
    <section className="institution-page institution-prose">
      <PageHeader
        eyebrow="PLATFORM İLKELERİ"
        title="Kullanım koşulları"
        description="UTRZONE’yi kullanırken bilmen gereken temel kurallar."
      />
      <article className="panel">
        <h2>Hesabın ve topluluk</h2>
        <p>
          Doğru hesap bilgileri kullan; şifreni ve doğrulama kodlarını paylaşma.
          Yorum ve isteklerde saygılı ol. Spam, taciz ve sistemi kötüye kullanma
          girişimleri moderasyon kapsamında değerlendirilir.
        </p>
        <h2>Yama, mod ve harici hizmetler</h2>
        <p>
          Desteklenen sürüm ve kurulum bilgileri proje sayfasında bulunur.
          Kurulum öncesinde kayıtlarını yedekle. Harici indirme ve ödeme
          hizmetlerinin kendi koşulları geçerlidir. UTRZONE ilgili oyun
          geliştiricileri veya yayıncılarıyla resmi bağlantısı olduğunu iddia
          etmez.
        </p>
        <h2>VIP, UCoin ve erken erişim</h2>
        <p>
          Üyelik süresi, coin bakiyesi ve erişim fiyatları ilgili ekranlarda
          gösterilir. UCoin başka hesaba devredilemez ve platform içinde nakde
          çevrilemez. Erken erişim açılmadan önce proje fiyatı ve işlem
          koşulları için ayrıca onay alınır. Kaldırılan projenin bağlantıları
          kapanabilir; işlem geçmişi korunur. Bu açıklamalar zorunlu yasal
          haklarını ortadan kaldırmaz.
        </p>
        <h2>Yetişkin içerikler</h2>
        <p>
          18+ işaretli içerikler yalnız reşit kullanıcılar içindir. Kapak
          filtresini açmak bir yaş doğrulama belgesi yerine geçmez. Reşit
          değilsen bu içeriklere erişme.
        </p>
        <h2>Soruların için</h2>
        <p>
          Hesap, içerik veya işlemle ilgili bir sorun için{" "}
          <a href="/support">destek ekibine ulaşabilirsin</a>. Verilerin nasıl
          işlendiğini <a href="/privacy">gizlilik sayfasında</a>{" "}
          inceleyebilirsin.
        </p>
      </article>
    </section>
  );
}

export function ContentPolicyPage() {
  return (
    <section className="institution-page institution-prose">
      <PageHeader
        eyebrow="İÇERİK & HAK SAHİPLERİ"
        title="Emeğe saygı. Açık iletişim."
        description="İçerik standartlarımız ve hak sahibi bildirimleri için iletişim yolu."
      />
      <article className="panel">
        <h2>Hak sahipliği</h2>
        <p>
          Oyunlar, karakterler, görseller ve markalar ilgili hak sahiplerine
          aittir. Bir yama veya mod paylaşımı, temel oyun üzerinde sahiplik ya
          da resmi ortaklık iddiası oluşturmaz.
        </p>
        <h2>İçerik bildirimleri</h2>
        <p>
          Hak sahibi veya yetkili temsilciysen ilgili sayfanın adresini, hak
          sahipliğini açıklayan bilgileri, itirazın konusunu ve ulaşabileceğimiz
          iletişim adresini gönder. Talebin ekip tarafından incelenir; gerekli
          görülen içerik erişimi inceleme sırasında sınırlandırılabilir.
        </p>
        <a
          className="secondary"
          href={
            "mailto:" +
            email +
            "?subject=" +
            encodeURIComponent("UTRZONE · İçerik / hak sahibi bildirimi")
          }
        >
          <Mail size={16} /> İçerik bildirimi gönder
        </a>
        <h2>Topluluk standardı</h2>
        <p>
          Zararlı dosyalar, yanıltıcı bağlantılar, çocukları cinselleştiren
          içerikler ve gerçek kişilere yönelik izinsiz cinsel materyaller kabul
          edilmez. Sorunlu bir içerik veya bağlantı görürsen proje adresiyle
          birlikte bize bildir.
        </p>
      </article>
    </section>
  );
}

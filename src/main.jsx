import {
  AboutPage,
  AdvertisePage,
  HelpPage,
  TermsPage,
  ContentPolicyPage,
} from "./platform-pages";
import { useClientNavigation, navigate } from "./navigation";
import { Select } from "./select";
import { FavoritesPage, FavoriteButton } from "./social-ui";
import { StaffReports } from "./staff-reports";
import { ConfirmProvider } from "./confirm-dialog";
import { WalletPage, WalletLink } from "./wallet-page";
import { CoinAdmin } from "./coin-admin";
import { MailPage } from "./mail-page";
import { CookieNotice, SupportPage, PrivacyPage } from "./site-extras";
import { RequestPage } from "./request-page";
import { preferencesAllowed } from "./consent";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  Gamepad2,
  Search,
  ShieldCheck,
  Sun,
  Moon,
  Plus,
  MessageSquare,
  Sparkles,
  Layers,
  FileText,
  ChevronRight,
  SlidersHorizontal,
  Globe2,
  LogOut,
  UserRound,
  RotateCw,
  Compass,
  WifiOff,
  Clock3,
  ChevronDown,
  Eye,
  Crown,
  Settings,
  Mail,
  Coins,
  Heart,
} from "lucide-react";
import { Cover } from "./components";
import { AuthPage, VerifyPage } from "./auth-pages";
import { AccountPage, GamePage, VipPage } from "./member-pages";
import { AdminPage } from "./admin-page";
import { SessionProvider, useSession, roleLabel } from "./state";
import { api, ADMIN, engines, readCatalog, saveCatalog } from "./api";
import "./style.css";
import "./refinements.css";
const VERSION = "0.11.2";
function Brand({ compact = false }) {
  return (
    <a href="/" className="brand" aria-label="UTRZONE ana sayfa">
      <img
        className={compact ? "brand-compact" : "brand-wide"}
        src={
          compact
            ? "/brand/compact.webp?v=0.11.2"
            : "/brand/horizontal.webp?v=0.11.2"
        }
        alt="UTRZONE · Underground Translation & Reworks"
        width={compact ? 240 : 290}
        height="48"
      />
      <img
        className="brand-mobile"
        src="/brand/compact.webp?v=0.11.2"
        alt="UTR · UTRZONE"
        width="190"
        height="36"
      />
    </a>
  );
}
function getTheme() {
  try {
    return preferencesAllowed() && localStorage.getItem("theme") === "light"
      ? "light"
      : "dark";
  } catch {
    return "dark";
  }
}
function GameCard({ game }) {
  const { nsfw: reveal } = useSession();
  return (
    <article className="game-card">
      <div className="card-art">
        <Cover game={game} />
        <img
          className="card-brand-bug"
          src="/brand/mark.webp?v=0.11.2"
          alt=""
          width="58"
          height="28"
        />
        {(!game.is_adult || reveal) && (
          <div className="card-image-label">
            <span>{game.engine}</span>
            {game.is_adult && <span className="age-badge">18+</span>}
          </div>
        )}
      </div>
      <div className="game-content">
        <div className="tags">
          {game.early_access_active && (
            <span className="early-badge">
              Erken erişim · {game.coin_price} UCoin
            </span>
          )}
          {game.has_tr_patch && (
            <span className="badge-patch">
              <FileText size={11} />
              TR Yama
            </span>
          )}
          {game.has_mod && (
            <span className="badge-mod">
              <Layers size={11} />
              Mod
            </span>
          )}
        </div>
        <h3>
          <a href={"/game?id=" + game.id}>{game.title}</a>
        </h3>
        <p className="card-description">{game.description}</p>
        <div className="card-date">
          Son güncelleme ·{" "}
          {new Date(game.updated_at || game.created_at).toLocaleDateString(
            "tr-TR",
          )}
        </div>
        <div className="card-bottom">
          <FavoriteButton gameId={game.id} count={game.favorite_count || 0} />
          <span>
            <Clock3 size={12} />v{game.version}
          </span>
          <a
            href={"/game?id=" + game.id}
            aria-label={game.title + " oyun sayfası"}
          >
            Oyunu keşfet
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </article>
  );
}
function Skeletons() {
  return (
    <div className="game-grid" role="status" aria-label="Oyunlar yükleniyor">
      {[1, 2, 3].map((i) => (
        <div className="skeleton-card" key={i}>
          <img
            className="loading-mark"
            src="/brand/mark.webp?v=0.11.2"
            alt=""
            width="90"
            height="36"
          />
          <div />
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
function App() {
  const routeKey = useClientNavigation(ADMIN);
  const { token, user, nsfw, showNsfw, logout } = useSession();
  const [theme, setTheme] = useState(getTheme),
    [games, setGames] = useState(() =>
      ["patch", "mod"].includes(
        new URLSearchParams(location.search).get("type"),
      )
        ? []
        : readCatalog()?.games || [],
    ),
    [query, setQuery] = useState(""),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState(() =>
      ["patch", "mod"].includes(
        new URLSearchParams(location.search).get("type"),
      )
        ? new URLSearchParams(location.search).get("type")
        : "all",
    ),
    [engine, setEngine] = useState("all"),
    [status, setStatus] = useState("loading"),
    [page, setPage] = useState(1),
    [more, setMore] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    const closeMenu = (event) => {
      const menu = document.querySelector(".user-menu[open]");
      if (!menu) return;
      if (event.type === "keydown" && event.key === "Escape") {
        menu.open = false;
        menu.querySelector("summary")?.focus();
      } else if (event.type === "pointerdown" && !menu.contains(event.target))
        menu.open = false;
    };
    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeMenu);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeMenu);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      if (preferencesAllowed()) localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    if (location.pathname !== "/") return;
    const controller = new AbortController();
    setStatus("loading");
    api(
      "/games?" +
        new URLSearchParams({
          q: search,
          page: String(page),
          type: filter,
          engine,
        }),
      {
        signal: controller.signal,
      },
    )
      .then((d) => {
        setGames((g) =>
          page === 1
            ? d.games
            : [
                ...new Map(
                  [...g, ...d.games].map((item) => [item.id, item]),
                ).values(),
              ],
        );
        if (page === 1 && !search && filter === "all" && engine === "all")
          saveCatalog(d);
        setMore(d.has_more);
        setStatus("ready");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, [search, page, retry, filter, engine, routeKey]);
  useEffect(() => {
    if (location.pathname === "/") {
      const type = new URLSearchParams(location.search).get("type");
      if (["patch", "mod"].includes(type)) {
        setFilter(type);
        setPage(1);
      }
    }
  }, [routeKey]);
  const shown = games.filter(
    (g) =>
      (engine === "all" || g.engine === engine) &&
      (filter === "all" || (filter === "patch" ? g.has_tr_patch : g.has_mod)),
  );
  const request = () => {
    navigate(user ? "/requests" : "/login?next=%2Frequests");
  };
  const routePath = location.pathname.replace(/\/$/, "");
  const adminPage = routePath === "/" + ADMIN || routePath === "/manage";
  const verifyPage =
    routePath === "/verify" ||
    (routePath === "" && new URLSearchParams(location.search).has("token"));
  const routeContent =
    routePath === "/about" ? (
      <AboutPage />
    ) : routePath === "/advertise" ? (
      <AdvertisePage />
    ) : routePath === "/help" ? (
      <HelpPage />
    ) : routePath === "/terms" ? (
      <TermsPage />
    ) : routePath === "/content-policy" ? (
      <ContentPolicyPage />
    ) : routePath === "/favorites" ? (
      <FavoritesPage />
    ) : routePath === "/reports" ? (
      <StaffReports />
    ) : routePath === "/wallet" ? (
      <WalletPage />
    ) : routePath === "/manage-coins" ? (
      <CoinAdmin />
    ) : routePath === "/mail" ? (
      <MailPage />
    ) : routePath === "/requests" ? (
      <RequestPage />
    ) : routePath === "/support" ? (
      <SupportPage />
    ) : routePath === "/privacy" ? (
      <PrivacyPage />
    ) : verifyPage ? (
      <VerifyPage />
    ) : adminPage ? (
      <AdminPage />
    ) : routePath === "/login" ? (
      <AuthPage />
    ) : routePath === "/register" ? (
      <AuthPage mode="register" />
    ) : routePath === "/forgot-password" ? (
      <AuthPage mode="forgot" />
    ) : routePath === "/account" ? (
      <AccountPage />
    ) : routePath === "/game" ? (
      <GamePage />
    ) : routePath === "/vip" ? (
      <VipPage />
    ) : null;
  function category(value) {
    if (location.pathname !== "/") {
      navigate("/?type=" + value + "#library");
      return;
    }
    setPage(1);
    if (filter !== value || page !== 1) setGames([]);
    setFilter(value);
    document.getElementById("library")?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <>
      <a className="skip-link" href="#main">
        İçeriğe geç
      </a>
      <div className="site-header">
        <header className="topbar">
          <Brand />
          <nav aria-label="Ana menü">
            <a href="/#library" className={!routeContent ? "nav-active" : ""}>
              <Compass size={16} />
              Keşfet
            </a>
            <button onClick={() => category("patch")}>
              <FileText size={15} />
              TR Yamalar
            </button>
            <button onClick={() => category("mod")}>
              <Layers size={15} />
              Modlar
            </button>
            <a href="/support" className="support-nav">
              Destek
            </a>
            <button onClick={request}>
              İstek oyun
              <Plus size={14} />
            </button>
          </nav>
          <div className="account">
            <WalletLink />
            <button
              className="icon theme-toggle"
              aria-label={
                theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"
              }
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className={"icon nsfw-toggle " + (nsfw ? "enabled" : "")}
              aria-label={
                nsfw ? "18+ kapaklarını gizle" : "18+ kapaklarını göster"
              }
              aria-pressed={nsfw}
              onClick={() => showNsfw(!nsfw)}
              title="18+ içerik tercihi"
            >
              <Eye size={17} />
              <small>18+</small>
            </button>
            <a href="/vip" className="header-vip" aria-label="VIP üyelik">
              <Crown size={17} />
            </a>
            {user ? (
              <details className="user-menu">
                <summary aria-label={"Hesap menüsü · " + user.display_name}>
                  <UserRound size={15} />
                  <span>{user.display_name}</span>
                  <ChevronDown size={12} />
                </summary>
                <div>
                  <div className="user-menu-identity">
                    <strong>{user.display_name}</strong>
                    <small>{roleLabel[user.role]}</small>
                  </div>
                  <a href="/account">
                    <Settings size={14} />
                    Hesap ayarları
                  </a>
                  <a href="/vip">
                    <Crown size={14} />
                    VIP üyeliğim
                  </a>
                  {user.permissions.moderate_comments && (
                    <a href="/manage">
                      <ShieldCheck size={14} />
                      Yönetim merkezi
                    </a>
                  )}
                  {user.permissions.manage_games && (
                    <a href="/mail">
                      <Mail size={14} /> Kurumsal e-posta
                    </a>
                  )}
                  <a href="/favorites">
                    <Heart size={14} /> Favorilerim
                  </a>
                  <a href="/wallet">
                    <Coins size={14} /> UCoin cüzdanım
                  </a>
                  {user.permissions.manage_coins && (
                    <a href="/manage-coins">
                      <ShieldCheck size={14} /> Coin yönetimi
                    </a>
                  )}
                  {user.permissions.manage_games && (
                    <a href="/reports">
                      <ShieldCheck size={14} /> Proje raporları
                    </a>
                  )}
                  <button onClick={() => logout().catch(() => {})}>
                    <LogOut size={14} />
                    Çıkış yap
                  </button>
                </div>
              </details>
            ) : (
              <a className="secondary login-button" href="/login">
                <UserRound size={15} />
                Giriş yap
              </a>
            )}
          </div>
        </header>
      </div>
      <main id="main">
        {(routeContent &&
          React.cloneElement(routeContent, { key: routeKey })) || (
          <>
            <div className="page-intro">
              <p>
                <span className="dot" />
                UTRZONE · YAMA KÜTÜPHANESİ
              </p>
              <span>Türkçe yama & mod platformu</span>
            </div>
            <section className="hero" aria-label="UTRZONE dünyasını keşfet">
              <div className="hero-image" />
              <div className="hero-shade" />
              <div className="hero-copy">
                <span className="hero-pill">
                  <Sparkles size={13} />
                  UTR / MODS & PATCHES
                </span>
                <h1>
                  Türkçe oyna.
                  <br />
                  <em>Kendi deneyimini kur.</em>
                </h1>
                <p>
                  Hikâyeyi kendi dilinde yaşa. Türkçe yamalar ve modlarla
                  sevdiğin oyunları yeniden keşfet.
                </p>
                <div className="hero-actions">
                  <a href="#library" className="primary">
                    Oyunları keşfet
                    <ArrowRight size={17} />
                  </a>
                  <button className="hero-secondary" onClick={request}>
                    Oyun isteği oluştur
                    <ArrowUpRight size={16} />
                  </button>
                </div>
                <div className="hero-note">
                  <ShieldCheck size={14} />
                  <span>Keşfetmek ve indirmek için üyelik gerekmez.</span>
                </div>
              </div>
              <div className="hero-caption">
                <span className="caption-line" />
                <span>
                  DAHA FAZLA HİKÂYE.
                  <br />
                  <strong>DAHA AZ SINIR.</strong>
                </span>
                <span className="hero-index">
                  01 <i>/ UTRZONE</i>
                </span>
              </div>
            </section>
            <section
              className="discovery-strip"
              aria-label="Keşif kategorileri"
            >
              <button onClick={() => category("patch")}>
                <span className="category-icon blue">
                  <FileText size={21} />
                </span>
                <span>
                  <strong>Oyunun dili Türkçe</strong>
                  <small>Türkçe yamaları keşfet</small>
                </span>
                <ChevronRight size={17} />
              </button>
              <button onClick={() => category("mod")}>
                <span className="category-icon violet">
                  <Layers size={21} />
                </span>
                <span>
                  <strong>Deneyimini yükselt</strong>
                  <small>Oyun modlarına göz at</small>
                </span>
                <ChevronRight size={17} />
              </button>
              <button onClick={request}>
                <span className="category-icon mint">
                  <MessageSquare size={21} />
                </span>
                <span>
                  <strong>Sıradaki oyunu sen seç</strong>
                  <small>İsteğini toplulukla paylaş</small>
                </span>
                <ChevronRight size={17} />
              </button>
            </section>
            <section id="library" className="library">
              <div className="section-head">
                <div>
                  <p className="eyebrow">
                    <span />
                    KÜTÜPHANE
                  </p>
                  <h2>
                    Yama kütüphanesi<span className="heading-dot">.</span>
                  </h2>
                  <p className="section-description">
                    Türkçe yamalar, yeni modlar ve keşfedilecek hikâyeler.
                  </p>
                </div>
                <span className="catalog-sort">
                  <Clock3 size={14} />
                  En yeni eklenenler
                </span>
              </div>
              {status === "loading" && (
                <p className="catalog-progress" role="status">
                  Kütüphane güncelleniyor…{" "}
                  {games.length > 0
                    ? "Son görüntülenen oyunlar aşağıda."
                    : "Oyunları senin için hazırlıyoruz."}
                </p>
              )}
              {status === "error" && games.length > 0 && (
                <p className="notice" role="status">
                  Son görüntülenen kütüphane gösteriliyor. Güncel bilgiler için{" "}
                  <button onClick={() => setRetry((r) => r + 1)}>
                    tekrar dene
                  </button>
                  .
                </p>
              )}
              <div className="toolbar">
                <div className="tabs" aria-label="İçerik türü">
                  {[
                    ["all", "Tüm oyunlar", Gamepad2],
                    ["patch", "TR Yamalar", FileText],
                    ["mod", "Modlar", Layers],
                  ].map(([key, label, Icon]) => (
                    <button
                      key={key}
                      aria-pressed={filter === key}
                      className={filter === key ? "active" : ""}
                      onClick={() => {
                        setPage(1);
                        if (filter !== key || page !== 1) setGames([]);
                        setFilter(key);
                      }}
                    >
                      <Icon size={15} />
                      {label}
                      {key === "all" && status === "ready" && (
                        <span
                          className="tab-count"
                          title="Yüklenen oyun sayısı"
                        >
                          {games.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="search-controls">
                  <form
                    className="search"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setPage(1);
                      setGames([]);
                      setSearch(query);
                      setRetry((r) => r + 1);
                    }}
                  >
                    <Search size={17} />
                    <input
                      aria-label="Oyun ara"
                      placeholder="Oyun adı ara…"
                      value={query}
                      maxLength={100}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <button aria-label="Ara">
                      <ArrowRight size={16} />
                    </button>
                  </form>
                  <div className="select-wrap">
                    <SlidersHorizontal size={14} />
                    <Select
                      aria-label="Oyun motoru filtresi"
                      value={engine}
                      onChange={(e) => {
                        setPage(1);
                        setGames([]);
                        setEngine(e.target.value);
                      }}
                    >
                      <option value="all">Tüm motorlar</option>
                      {engines.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
              {status === "error" && games.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">
                    <WifiOff size={28} />
                  </div>
                  <span className="empty-label">BAĞLANTI KESİLDİ</span>
                  <h3>Kısa bir mola.</h3>
                  <p>
                    Kütüphaneye şu an ulaşılamıyor.
                    <br />
                    Biraz sonra tekrar deneyebilirsin.
                  </p>
                  <button
                    className="secondary"
                    onClick={() => setRetry((r) => r + 1)}
                  >
                    <RotateCw size={15} />
                    Tekrar dene
                  </button>
                </div>
              ) : status === "loading" && page === 1 && games.length === 0 ? (
                <Skeletons />
              ) : shown.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">
                    <Gamepad2 size={30} />
                  </div>
                  <span className="empty-label">YENİ BİR BAŞLANGIÇ</span>
                  <h3>
                    {games.length
                      ? "Aradığın macerayı bulamadık."
                      : "Büyük hikâyeler yakında burada."}
                  </h3>
                  <p>
                    {games.length
                      ? "Aramanı veya filtrelerini değiştirmeyi dene."
                      : "Kütüphanemiz hazırlanıyor. İlk görmek istediğin oyunu bize öner."}
                  </p>
                  <button className="secondary" onClick={request}>
                    <Plus size={16} />
                    Oyun isteği gönder
                  </button>
                </div>
              ) : (
                <div className="game-grid">
                  {shown.map((g) => (
                    <GameCard key={g.id} game={g} />
                  ))}
                </div>
              )}
              {more && status !== "error" && (
                <button
                  className="secondary load-more"
                  disabled={status === "loading"}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {status === "loading" ? "Yükleniyor…" : "Daha fazla oyun"}
                  <ChevronDown size={16} />
                </button>
              )}
              <div className="library-footnote">
                <ShieldCheck size={13} />
                <span>
                  İndirmeler herkese açık. Yorumlar ve istekler doğrulanmış
                  üyelere özel.
                </span>
                <span className="filter-note">
                  Filtreler tüm kütüphanede aranır.
                </span>
              </div>
            </section>
            <section className="community">
              <div className="community-visual" aria-hidden="true">
                <span />
                <img
                  src="/brand/mark.webp?v=0.11.2"
                  alt=""
                  width="120"
                  height="50"
                />
              </div>
              <div className="community-copy">
                <span className="eyebrow">BİRLİKTE DAHA FAZLASI</span>
                <h2>Sıradaki yamayı birlikte seçelim.</h2>
                <p>
                  Türkçe oynamak istediğin oyunu paylaş. <br />
                  UTRZONE’nin bir sonraki adımına sen de yön ver.
                </p>
              </div>
              <button className="primary" onClick={request}>
                Oyun isteği oluştur
                <ArrowUpRight size={17} />
              </button>
            </section>
          </>
        )}
      </main>
      <footer>
        <div className="footer-directory">
          <div className="footer-identity">
            <Brand compact />
            <p>Underground Translation & Reworks</p>
            <p>
              Türkçe yamalar, oyun modları ve yeni hikâyeleri birlikte keşfeden
              bir topluluk.
            </p>
            <a href="/about" className="footer-story">
              Hikâyemizi keşfet <ArrowUpRight size={14} />
            </a>
          </div>
          <nav aria-label="Platform bağlantıları">
            <h2>Platform</h2>
            <a href="/#library">Oyun kütüphanesi</a>
            <a href="/?type=patch#library">Türkçe yamalar</a>
            <a href="/?type=mod#library">Oyun modları</a>
            <a href="/vip">VIP üyelik</a>
            <a href="/wallet">UCoin & günlük ödüller</a>
          </nav>
          <nav aria-label="Topluluk bağlantıları">
            <h2>Topluluk</h2>
            <a href={user ? "/account" : "/login"}>
              {user ? "Hesabım" : "Giriş yap"}
            </a>
            <a href="/requests">Oyun isteği oluştur</a>
            <a href="/help">Yardım merkezi</a>
            <a href="/support">Destek & iletişim</a>
            <a href="/advertise">Reklam & iş birliği</a>
          </nav>
          <nav aria-label="Bilgi ve politika bağlantıları">
            <h2>Bilgi & İlkeler</h2>
            <a href="/about">Hakkımızda</a>
            <a href="/terms">Kullanım koşulları</a>
            <a href="/content-policy">İçerik & telif</a>
            <a href="/privacy">Gizlilik & hesap verileri</a>
            <button
              onClick={() =>
                window.dispatchEvent(new Event("utrzone-cookie-settings"))
              }
            >
              Çerez tercihleri
            </button>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} UTRZONE. Oyuncular için tasarlandı.
          </span>
          <span>
            <Globe2 size={13} />
            Türkçe <i />v{VERSION}
          </span>
        </div>
      </footer>
      <CookieNotice />
    </>
  );
}
createRoot(document.getElementById("root")).render(
  <ConfirmProvider>
    <SessionProvider>
      <App />
    </SessionProvider>
  </ConfirmProvider>,
);

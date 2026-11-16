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
} from "lucide-react";
import { Cover } from "./components";
import { AuthPage, VerifyPage } from "./auth-pages";
import { AccountPage, GamePage, VipPage } from "./member-pages";
import { AdminPage } from "./admin-page";
import { SessionProvider, useSession } from "./state";
import { api, ADMIN, engines } from "./api";
import "./style.css";
const VERSION = "0.4.0";
function Brand() {
  return (
    <a href="/" className="brand" aria-label="UnlockTR ana sayfa">
      <span className="brand-icon">
        <Gamepad2 size={24} strokeWidth={2.4} />
      </span>
      <span>
        unlock<span className="brand-tr">TR</span>
        <small>OYUNUN SINIRLARINI KALDIR</small>
      </span>
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
        {(!game.is_adult || reveal) && (
          <div className="card-image-label">
            <span>{game.engine}</span>
            {game.is_adult && <span className="age-badge">18+</span>}
          </div>
        )}
      </div>
      <div className="game-content">
        <div className="tags">
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
        <div className="card-bottom">
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
  const { token, user, nsfw, showNsfw, logout } = useSession();
  const [theme, setTheme] = useState(getTheme),
    [games, setGames] = useState([]),
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
    document.documentElement.dataset.theme = theme;
    try {
      if (preferencesAllowed()) localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    api("/games?q=" + encodeURIComponent(search) + "&page=" + page, {
      signal: controller.signal,
    })
      .then((d) => {
        setGames((g) => (page === 1 ? d.games : [...g, ...d.games]));
        setMore(d.has_more);
        setStatus("ready");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, [search, page, retry]);
  const shown = games.filter(
    (g) =>
      (engine === "all" || g.engine === engine) &&
      (filter === "all" || (filter === "patch" ? g.has_tr_patch : g.has_mod)),
  );
  const request = () => {
    location.href = user ? "/requests" : "/login?next=%2Frequests";
  };
  const routePath = location.pathname.replace(/\/$/, "");
  const adminPage = routePath === "/" + ADMIN || routePath === "/manage";
  const verifyPage =
    routePath === "/verify" ||
    (routePath === "" && new URLSearchParams(location.search).has("token"));
  const routeContent =
    routePath === "/requests" ? (
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
      location.href = "/?type=" + value + "#library";
      return;
    }
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
              Destek ol
            </a>
            <button onClick={request}>
              İstek oyun
              <Plus size={14} />
            </button>
          </nav>
          <div className="account">
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
                <summary>
                  <UserRound size={15} />
                  <span>{user.display_name}</span>
                  <ChevronDown size={12} />
                </summary>
                <div>
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
        {routeContent || (
          <>
            <div className="page-intro">
              <p>
                <span className="dot" />
                HİKÂYEN BURADA DEVAM EDİYOR
              </p>
              <span>Türkçe yama & mod platformu</span>
            </div>
            <section className="hero" aria-label="UnlockTR dünyasını keşfet">
              <div className="hero-image" />
              <div className="hero-shade" />
              <div className="hero-copy">
                <span className="hero-pill">
                  <Sparkles size={13} />
                  YENİ DÜNYALARIN KİLİDİNİ AÇ
                </span>
                <h1>
                  Aynı oyun.
                  <br />
                  <em>Bambaşka deneyim.</em>
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
                  01 <i>/ UNLOCKTR</i>
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
                    Bir sonraki maceran<span className="heading-dot">.</span>
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
                      onClick={() => setFilter(key)}
                    >
                      <Icon size={15} />
                      {label}
                      {key === "all" && status === "ready" && (
                        <span className="tab-count">{games.length}</span>
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
                      setSearch(query);
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
                    <select
                      aria-label="Oyun motoru filtresi"
                      value={engine}
                      onChange={(e) => setEngine(e.target.value)}
                    >
                      <option value="all">Tüm motorlar</option>
                      {engines.map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {status === "error" ? (
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
              ) : status === "loading" && page === 1 ? (
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
                  Filtreler yüklenen oyunlara uygulanır.
                </span>
              </div>
            </section>
            <section className="community">
              <div className="community-visual" aria-hidden="true">
                <span />
                <Gamepad2 size={64} strokeWidth={1.2} />
                <Plus size={17} />
              </div>
              <div className="community-copy">
                <span className="eyebrow">BİRLİKTE DAHA FAZLASI</span>
                <h2>Sen iste. Yeni bir hikâye başlasın.</h2>
                <p>
                  Türkçe oynamak istediğin oyunu paylaş.
                  <br />
                  UnlockTR’nin bir sonraki adımına sen de yön ver.
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
        <div className="footer-main">
          <Brand />
          <p>
            Her oyunda yeni bir dünya.
            <br />
            Her dünyada kendi dilin.
          </p>
          <div className="footer-links">
            <a href="/#library">Kütüphane</a>
            <a href="/login">Giriş yap</a>
            <a href="/register">Hesap oluştur</a>
            <a href="/vip">VIP</a>
            <a href="/support">Destek ol</a>
            <button
              onClick={() =>
                window.dispatchEvent(new Event("unlocktr-cookie-settings"))
              }
            >
              Çerez tercihleri
            </button>
            <button onClick={request}>
              Oyun isteği
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} UnlockTR. Oyuncular için tasarlandı.
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
  <SessionProvider>
    <App />
  </SessionProvider>,
);

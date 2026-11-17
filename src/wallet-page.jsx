import React, { useState, useEffect } from "react";
import {
  Coins,
  Gift,
  Crown,
  ArrowUpRight,
  History,
  LockKeyhole,
} from "lucide-react";
import { api } from "./api";
import { useSession } from "./state";
import { Protected, PageHeader, Notice } from "./ui";
export const coinsChanged = () =>
  window.dispatchEvent(new Event("unlocktr-coins"));
export function WalletLink() {
  const { user, token } = useSession();
  const [balance, setBalance] = useState(null);
  useEffect(() => {
    if (!user) return;
    let current = true;
    const load = () =>
      api("/wallet/balance", { token })
        .then((d) => {
          if (current) setBalance(d.balance);
        })
        .catch(() => {});
    load();
    window.addEventListener("unlocktr-coins", load);
    return () => {
      current = false;
      window.removeEventListener("unlocktr-coins", load);
    };
  }, [token, !!user]);
  return (
    <a className="wallet-nav" href="/wallet" aria-label="UCoin cüzdanı">
      <Coins size={17} />
      <span>
        {user && balance !== null ? balance.toLocaleString("tr-TR") : "UCoin"}
      </span>
    </a>
  );
}
export function WalletPage() {
  const s = useSession(),
    [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tick, setTick] = useState(0);
  useEffect(() => {
    if (!s.user) return;
    const c = new AbortController();
    api("/wallet", { token: s.token, signal: c.signal })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => c.abort();
  }, [s.token, !!s.user, tick]);
  async function claim() {
    setBusy(true);
    try {
      const d = await api("/wallet/daily", { token: s.token, method: "POST" });
      setError(d.message);
      setTick((t) => t + 1);
      coinsChanged();
    } catch (e) {
      setError(e.message);
      setTick((t) => t + 1);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Protected user={s.user} loading={s.loading}>
      <section className="wallet-page">
        <PageHeader
          eyebrow="UNLOCKTR UCOIN"
          title="Her gün yeni bir adım."
          description="Günlük ödülünü topla, erken erişim için biriktir. Cüzdanın ve açtığın projeler tek yerde."
        />
        <Notice>{error}</Notice>
        {!data ? (
          <div className="panel">
            <p role="status">Cüzdan yükleniyor…</p>
            <button className="secondary" onClick={() => setTick((t) => t + 1)}>
              Tekrar dene
            </button>
          </div>
        ) : (
          <>
            <div className="wallet-hero panel">
              <div className="wallet-balance">
                <span className="coin-emblem">
                  <Coins size={32} />
                </span>
                <div>
                  <small>UCOIN BAKİYEN</small>
                  <h2>
                    {data.balance.toLocaleString("tr-TR")} <span>UCoin</span>
                  </h2>
                </div>
              </div>
              <a className="secondary" href="#coin-packages">
                Coin paketlerini incele <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="wallet-dashboard">
              <section className="panel daily-panel">
                <div className="section-head">
                  <h2>
                    <Gift size={20} /> Günlük keşif ödülü
                  </h2>
                  <span className="role-tag">
                    {s.user?.vip.active ? "VIP · 2 kat ödül" : "Standart ödül"}
                  </span>
                </div>
                <p className="muted">
                  Her takvim günü bir kez. Art arda 7 gün boyunca ödülün artar;
                  ardından yeni seri başlar. Bir gün kaçırırsan seri ilk güne
                  döner.
                </p>
                <div className="daily-grid">
                  {data.rewards.map((amount, i) => (
                    <div
                      key={i}
                      className={
                        "daily-day " +
                        (i <
                        (data.progress ??
                          (data.claimed_today
                            ? data.streak
                            : Math.max(data.next_day - 1, 0)))
                          ? "earned"
                          : !data.claimed_today && i === data.next_day - 1
                            ? "available"
                            : "")
                      }
                    >
                      <small>{i + 1}. GÜN</small>
                      <strong>{amount}</strong>
                      <span>UCoin</span>
                      {i <
                      (data.progress ??
                        (data.claimed_today
                          ? data.streak
                          : Math.max(data.next_day - 1, 0))) ? (
                        "✓"
                      ) : (
                        <LockKeyhole size={14} />
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className="primary"
                  disabled={busy || data.claimed_today}
                  onClick={claim}
                >
                  <Gift size={17} />
                  {data.claimed_today
                    ? "Bugünkü ödül alındı"
                    : busy
                      ? "Alınıyor…"
                      : data.next_reward + " UCoin ödülümü al"}
                </button>
                <p className="muted small">
                  Günler Türkiye saatiyle 00.00'da yenilenir. Giriş yapmak tek
                  başına yeterli değildir; ödülünü bu düğmeyle al.
                </p>
              </section>
              <aside className="panel wallet-benefits">
                <Crown size={28} />
                <h2>VIP ile daha hızlı biriktir.</h2>
                <p>
                  2 kat günlük UCoin ve erken erişim projelerinde oyuna özel VIP
                  fiyatı. VIP de erken erişimi coinle açar; ücretsiz erişim
                  verilmez.
                </p>
                <a className="secondary" href="/vip">
                  VIP avantajları
                </a>
              </aside>
            </div>
            <section className="panel">
              <h2>
                <LockKeyhole size={20} /> Açtığın projeler
              </h2>
              {!data.unlocked.length ? (
                <p className="muted">
                  Henüz coinle açtığın bir proje yok. Erken erişim içerikleri
                  yayınlandığında burada takip edebilirsin.
                </p>
              ) : (
                <div className="unlocked-list">
                  {data.unlocked.map((g) => (
                    <a key={g.id} href={"/game?id=" + g.id}>
                      <strong>{g.title}</strong>
                      <span>
                        {g.paid} UCoin · Açıldı <ArrowUpRight size={14} />
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </section>
            <section id="coin-packages">
              <PageHeader
                eyebrow="MANUEL YÜKLEME"
                title="Bir sonraki keşfine hazırlan."
                description="Satış ItemSatış üzerinden, yükleme kurucu tarafından doğrulanarak yapılır."
              />
              <div className="coin-packages">
                {data.packages.map((p) => (
                  <article className="panel" key={p.coins}>
                    <Coins size={24} />
                    <h3>{p.coins} UCoin</h3>
                    <p className="price">
                      {p.price}
                      <span> TL</span>
                    </p>
                    <a
                      className="primary"
                      href="https://www.itemsatis.com/profil/haking06.html"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ItemSatış mağazası <ArrowUpRight size={15} />
                    </a>
                  </article>
                ))}
              </div>
              <p className="muted small">
                Mağazadaki ilan ve güncel fiyatı kontrol et. Ödeme sonrası hesap
                e-postanı ve sipariş numaranı satıcıya ilet. UCoin devredilemez,
                nakde çevrilemez ve yalnız UnlockTR içerik erişiminde
                kullanılır. Silinen hesabın coinleri yeni hesaba taşınmaz.
              </p>
            </section>
            <section className="panel">
              <h2>
                <History size={20} /> Son hareketler
              </h2>
              {!data.transactions.length ? (
                <p className="muted">İlk ödülünü aldığında burada görünecek.</p>
              ) : (
                <div className="coin-history">
                  {data.transactions.map((t) => (
                    <article key={t.id}>
                      <div>
                        <strong>{t.note}</strong>
                        <small>
                          {new Date(t.created_at).toLocaleString("tr-TR")}
                        </small>
                      </div>
                      <span
                        className={
                          t.amount > 0 ? "coin-positive" : "coin-negative"
                        }
                      >
                        {t.amount > 0 ? "+" : ""}
                        {t.amount} UCoin<small>Bakiye: {t.balance_after}</small>
                      </span>
                    </article>
                  ))}
                </div>
              )}
              <p className="muted small">
                Son 50 işlem gösterilir. Bakiye sunucuda doğrulanır.
              </p>
            </section>
          </>
        )}
      </section>
    </Protected>
  );
}

import { useConfirm } from "./confirm-dialog";
import React, { useState, useEffect } from "react";
import { Coins, Search, ShieldCheck } from "lucide-react";
import { useSession } from "./state";
import { api } from "./api";
import { Protected, PageHeader, Field, Notice } from "./ui";
export function CoinAdmin() {
  const confirm = useConfirm();
  const s = useSession(),
    [q, setQ] = useState(
      new URLSearchParams(location.search).get("email") || "",
    ),
    [search, setSearch] = useState(q),
    [users, setUsers] = useState([]),
    [deleted, setDeleted] = useState([]),
    [history, setHistory] = useState(null),
    [historyPage, setHistoryPage] = useState(1),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [target, setTarget] = useState(null),
    [tick, setTick] = useState(0),
    [reference, setReference] = useState(() => crypto.randomUUID());
  useEffect(() => {
    if (!s.user?.permissions.manage_coins) return;
    const c = new AbortController();
    Promise.all([
      api("/admin/coins/users?q=" + encodeURIComponent(search), {
        token: s.token,
        signal: c.signal,
      }),
      s.user.permissions.manage_users
        ? api("/admin/deleted-emails?q=" + encodeURIComponent(search), {
            token: s.token,
            signal: c.signal,
          })
        : Promise.resolve([]),
      api(
        "/admin/coins/history?q=" +
          encodeURIComponent(search) +
          "&page=" +
          historyPage,
        { token: s.token, signal: c.signal },
      ),
    ])
      .then(([u, d, h]) => {
        setHistory(h);
        setUsers(u);
        setDeleted(d);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setMessage(e.message);
      });
    return () => c.abort();
  }, [search, tick, s.token, !!s.user, historyPage]);
  async function grant(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (
      !(await confirm({
        title: "UCoin yüklemesini onayla",
        description:
          target.email + " hesabına " + data.amount + " UCoin eklenecek.",
        detail: data.reason,
        confirmLabel: "Yüklemeyi tamamla",
      }))
    )
      return;
    setBusy(true);
    try {
      const d = await api("/admin/coins/grant", {
        token: s.token,
        method: "POST",
        body: {
          email: target.email,
          amount: Number(data.amount),
          reason: data.reason,
          reference_id: reference,
        },
      });
      setMessage(d.message);
      window.dispatchEvent(new Event("utrzone-coins"));
      setTarget(null);
      setReference(crypto.randomUUID());
      setTick((t) => t + 1);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Protected user={s.user} loading={s.loading}>
      {s.user?.permissions.manage_coins ? (
        <section>
          <PageHeader
            eyebrow="EKİP · COIN OPERASYONLARI"
            title="Cüzdan ve hesap kayıtları."
            description="Doğrulanmış üyelere satış veya hediye coin yükle. Her yükleme işlem kaydına alınır."
          />
          <a className="back-link" href="/manage">
            Yönetim merkezine dön
          </a>
          <form
            className="search manage-search"
            onSubmit={(e) => {
              e.preventDefault();
              setHistoryPage(1);
              setSearch(q);
              setTick((t) => t + 1);
            }}
          >
            <Search size={16} />
            <input
              aria-label="Coin için e-posta veya ad ara"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              maxLength={254}
              placeholder="E-posta veya ad…"
            />
            <button aria-label="Üye ara">
              <Search size={16} />
            </button>
          </form>
          <Notice>{message}</Notice>
          <div className="coin-admin-layout">
            <section className="panel">
              <h2>
                <Coins size={19} /> Aktif üyeler
              </h2>
              {users.map((u) => (
                <article className="coin-admin-user" key={u.id}>
                  <div>
                    <strong>{u.display_name}</strong>
                    <small>{u.email}</small>
                    <span>{u.balance} UCoin</span>
                  </div>
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() => {
                      setTarget(u);
                      setReference(crypto.randomUUID());
                    }}
                  >
                    Coin yükle
                  </button>
                </article>
              ))}
              {!users.length && (
                <p className="muted">Eşleşen doğrulanmış hesap yok.</p>
              )}
            </section>
            <aside className="panel">
              {target ? (
                <>
                  <h2>Coin yükleme</h2>
                  <p>{target.email}</p>
                  <form onSubmit={grant}>
                    <Field
                      label="Eklenecek UCoin"
                      name="amount"
                      type="number"
                      min={1}
                      max={1000000}
                      step={1}
                      required
                    />
                    <Field
                      label="İşlem açıklaması / ItemSatış sipariş numarası"
                      name="reason"
                      minLength={3}
                      maxLength={250}
                      required
                    />
                    <p className="muted small">
                      Hediye tanımlamada açıklamaya hediye nedenini yaz. Ödeme
                      kontrolü manuel yapılır; bu işlem satış başlatmaz.
                    </p>
                    <button className="primary" disabled={busy}>
                      Yüklemeyi onayla
                    </button>
                    <button
                      type="button"
                      className="text-button"
                      disabled={busy}
                      onClick={() => setTarget(null)}
                    >
                      Vazgeç
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <ShieldCheck size={24} />
                  <h2>Kontrollü manuel yükleme</h2>
                  <p className="muted">
                    Bir üye seç. Coin yüklemesini kurucu ve yardımcı kurucular
                    yapabilir. İşlem yapan ekip üyesi geçmişe kaydedilir.
                  </p>
                </>
              )}
            </aside>
          </div>
          <section className="panel">
            <h2>Geçmiş yüklemeler</h2>
            <p className="muted">
              Kimin, hangi hesaba, ne kadar coin yüklediğini izle.
            </p>
            <div className="grant-history">
              {history?.history.map((h) => (
                <article key={h.id}>
                  <div>
                    <strong>{h.recipient_email}</strong>
                    <small>
                      {new Date(h.created_at).toLocaleString("tr-TR")}
                    </small>
                    <p>{h.note}</p>
                  </div>
                  <div>
                    <strong>+{h.amount} UCoin</strong>
                    <small>
                      {h.actor_name} ·{" "}
                      {h.actor_role === "founder"
                        ? "Kurucu"
                        : h.actor_role === "cofounder"
                          ? "Yardımcı kurucu"
                          : "Eski ekip üyesi"}
                    </small>
                    {h.actor_email && <small>{h.actor_email}</small>}
                    <small>İşlem sonrası: {h.balance_after}</small>
                  </div>
                </article>
              ))}
            </div>
            {history && !history.history.length && (
              <p className="muted">Henüz yükleme kaydı yok.</p>
            )}
            {history && (
              <div className="report-pagination">
                <button
                  className="secondary"
                  disabled={historyPage === 1}
                  onClick={() => setHistoryPage((p) => p - 1)}
                >
                  Önceki yüklemeler
                </button>
                <span>Sayfa {historyPage}</span>
                <button
                  className="secondary"
                  disabled={!history.has_more}
                  onClick={() => setHistoryPage((p) => p + 1)}
                >
                  Sonraki yüklemeler
                </button>
              </div>
            )}
          </section>
          {s.user.permissions.manage_users && (
            <section className="panel deleted-email-panel">
              <h2>Silinen e-postalar</h2>
              <p className="muted">
                Yalnız e-posta ve silinme tarihi tutulur. Aynı adresle yeni
                hesap doğrulandığında kayıt kalkar. Eski bakiye, roller veya
                erişimler geri yüklenmez. Eski anonim kayıtlardan e-posta geri
                kazanılamaz.
              </p>
              {deleted.map((d) => (
                <article className="audit-row" key={d.email}>
                  <strong>{d.email}</strong>
                  <time>{new Date(d.deleted_at).toLocaleString("tr-TR")}</time>
                </article>
              ))}
              {!deleted.length && (
                <p className="muted">Bu aramada silinmiş e-posta kaydı yok.</p>
              )}
              <small>
                Arama son 50 eşleşmeyi gösterir; bu alan yalnız kurucuya
                açıktır.
              </small>
            </section>
          )}
        </section>
      ) : (
        s.user && (
          <div className="empty">
            <h1>Bu alan kurucu ve yardımcı kuruculara açık.</h1>
            <a href="/account">Hesabıma dön</a>
          </div>
        )
      )}
    </Protected>
  );
}

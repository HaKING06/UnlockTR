import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  Coins,
  Heart,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { useSession } from "./state";
import { api } from "./api";
import { Protected, PageHeader, Notice } from "./ui";
export function StaffReports() {
  const s = useSession(),
    [rows, setRows] = useState([]),
    [page, setPage] = useState(1),
    [more, setMore] = useState(false),
    [q, setQ] = useState(""),
    [search, setSearch] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!s.user?.permissions.manage_games) return;
    const c = new AbortController();
    setBusy(true);
    api(
      "/admin/project-stats?page=" + page + "&q=" + encodeURIComponent(search),
      { token: s.token, signal: c.signal },
    )
      .then((d) => {
        setRows(d.projects);
        setMore(d.has_more);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setMessage(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setBusy(false);
      });
    return () => c.abort();
  }, [s.token, !!s.user, page, search]);
  return (
    <Protected user={s.user} loading={s.loading}>
      {s.user?.permissions.manage_games ? (
        <section>
          <PageHeader
            eyebrow="EKİP · PROJE ANALİTİĞİ"
            title="Her projenin nabzı."
            description="Erken erişim alıcılarını, harcanan coinleri ve topluluk etkileşimini izle."
          />
          <a className="back-link" href="/manage">
            Yönetim merkezine dön
          </a>
          <form
            className="search manage-search"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(q);
            }}
          >
            <input
              aria-label="Raporlarda oyun ara"
              placeholder="Proje adı…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              maxLength={150}
            />
            <button>Filtrele</button>
          </form>
          <Notice>{message}</Notice>
          <p className="muted small">
            İndirme sayısı; Türkiye takvim gününde aynı ziyaretçi / oyun /
            sağlayıcı için tekilleştirilmiş bağlantı açma talepleridir. Dosyanın
            tamamının indirildiğini kanıtlamaz. Alıcı sayısı anonimleştirilen
            hesaplar dahil kalıcı satın alma kayıtlarıdır.
          </p>
          <div className="project-report-list">
            {rows.map((g) => (
              <article className="panel project-report" key={g.id}>
                <div className="report-title">
                  <span>
                    <small>
                      {g.deleted_at
                        ? "KALDIRILDI · SATIŞ ARŞİVİ"
                        : g.early_access_active
                          ? "ERKEN ERİŞİM"
                          : "GENEL ERİŞİM"}
                    </small>
                    <h2>{g.title}</h2>
                    <small>
                      v{g.version} ·{" "}
                      {new Date(g.updated_at).toLocaleDateString("tr-TR")}
                    </small>
                  </span>
                  {!g.deleted_at && (
                    <a href={"/manage?edit=" + g.id} className="secondary">
                      Projeyi yönet <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
                <div className="report-metrics">
                  <div>
                    <Users size={18} />
                    <strong>{g.buyers}</strong>
                    <span>Alıcı kaydı</span>
                  </div>
                  <div>
                    <Coins size={18} />
                    <strong>{g.coins_spent}</strong>
                    <span>Harcanan UCoin</span>
                  </div>
                  <div>
                    <Heart size={18} />
                    <strong>{g.favorite_count}</strong>
                    <span>Favori</span>
                  </div>
                  <div>
                    <Download size={18} />
                    <strong>{g.download_count}</strong>
                    <span>Bağlantı açılışı</span>
                  </div>
                </div>
                <small className="muted">
                  VIP alımlar: {g.vip_buyers} · 0.7.0 öncesi kayıtların VIP
                  durumu bilinmeyebilir.
                </small>
              </article>
            ))}
          </div>
          {busy && <p role="status">Raporlar yükleniyor…</p>}
          <div className="report-pagination">
            <button
              className="secondary"
              disabled={page === 1 || busy}
              onClick={() => setPage((p) => p - 1)}
            >
              Önceki
            </button>
            <span>Sayfa {page}</span>
            <button
              className="secondary"
              disabled={!more || busy}
              onClick={() => setPage((p) => p + 1)}
            >
              Sonraki
            </button>
          </div>
        </section>
      ) : (
        s.user && (
          <div className="empty">
            <h1>Bu raporlar kurucu ve yardımcı kuruculara açık.</h1>
          </div>
        )
      )}
    </Protected>
  );
}

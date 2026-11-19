import { gamePath } from "./game-url";
import { useConfirm } from "./confirm-dialog";
import React, { useEffect, useState } from "react";
import { Coins, LockKeyhole, UnlockKeyhole } from "lucide-react";
import { useSession } from "./state";
import { api } from "./api";
import { coinsChanged } from "./wallet-page";
import { Notice } from "./ui";
export function EarlyAccess({ game, onAccess }) {
  const confirm = useConfirm();
  const { user, token } = useSession(),
    [access, setAccess] = useState(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [tick, setTick] = useState(0);
  useEffect(() => {
    if (!user) return;
    let current = true;
    api("/games/" + game.id + "/access", { token })
      .then(async (d) => {
        if (!current) return;
        setAccess(d);
        if (d.unlocked) {
          const link = await api("/games/" + game.id + "/downloads/standard", {
            token,
          });
          if (current) onAccess(link.url);
        }
      })
      .catch((e) => {
        if (current) setMessage(e.message);
      });
    return () => {
      current = false;
    };
  }, [game.id, token, !!user, tick]);
  async function unlock() {
    if (
      !(await confirm({
        title: "Erken erişimi aç",
        description:
          game.title +
          " hesabına açılacak. " +
          access.price +
          " UCoin bakiyenden düşülecek.",
        detail:
          "İşlem uygulama üzerinden geri alınamaz; otomatik coin iadesi yapılmaz. Proje sonradan yayından kaldırılırsa indirme erişimi kapanır. Yasal hakların saklıdır.",
        acknowledgement:
          "Bedeli kontrol ettim; coin harcamasını ve anında erişim açılmasını onaylıyorum.",
        confirmLabel: access.price + " UCoin harca ve aç",
      }))
    )
      return;
    setBusy(true);
    try {
      const d = await api("/games/" + game.id + "/unlock", {
        method: "POST",
        token,
        body: { expected_price: access.price, accepted_no_refund: true },
      });
      setMessage(d.message);
      setTick((t) => t + 1);
      coinsChanged();
    } catch (e) {
      setMessage(e.message);
      setTick((t) => t + 1);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="early-access-panel">
      <span className="early-badge">
        <LockKeyhole size={13} /> ERKEN ERİŞİM
      </span>
      <h3>Bu hikâyeye erkenden katıl.</h3>
      <p>
        Genel erişim:{" "}
        {new Date(game.early_access_until).toLocaleString("tr-TR")}.
      </p>
      <div className="early-prices">
        <span>
          Standart <strong>{game.coin_price} UCoin</strong>
        </span>
        <span>
          VIP <strong>{game.vip_coin_price} UCoin</strong>
        </span>
      </div>
      <p className="muted small">
        Bir kez aç, bu projeye hesabınla eriş. VIP ücretsiz açmaz; VIP fiyatı ve
        2 kat günlük ödül sunar. Genel erişim tarihinde coin gereksinimi kalkar.
      </p>
      {!user ? (
        <a
          className="primary"
          href={"/login?next=" + encodeURIComponent(gamePath(game))}
        >
          Giriş yap ve erişimi aç
        </a>
      ) : access?.unlocked ? (
        <span className="role-tag">
          <UnlockKeyhole size={15} /> Erişimin açık
        </span>
      ) : access ? (
        <>
          <p>
            Bakiye: <strong>{access.balance} UCoin</strong>
          </p>
          <button
            className="primary"
            disabled={busy || access.balance < access.price}
            onClick={unlock}
          >
            <Coins size={16} />
            {busy ? "İşleniyor…" : access.price + " UCoin ile aç"}
          </button>
          {access.balance < access.price && (
            <a className="secondary" href="/wallet">
              Günlük ödül ve cüzdan
            </a>
          )}
        </>
      ) : (
        <button className="secondary" onClick={() => setTick((t) => t + 1)}>
          Erişimi kontrol et
        </button>
      )}
      <Notice>{message}</Notice>
    </div>
  );
}

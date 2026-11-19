import React, { useState, useEffect } from "react";
import { Coins } from "lucide-react";
import { api } from "./api";
import { useSession } from "./state";
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
    window.addEventListener("utrzone-coins", load);
    return () => {
      current = false;
      window.removeEventListener("utrzone-coins", load);
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

// Public readiness traffic only; no account data or credentials.
(() => {
  if (window.__utrzoneWarmup) return;
  window.__utrzoneWarmup = true;
  const endpoint = "https://unlocktr-backend.onrender.com/api/health",
    key = "utrzone-api-heartbeat";
  let pending = false,
    last = 0;
  async function ping() {
    if (pending || navigator.onLine === false) return;
    let shared = 0;
    try {
      shared = Number(localStorage.getItem(key)) || 0;
    } catch {}
    const now = Date.now();
    if (now - Math.max(last, shared) < 240000) return;
    last = now;
    try {
      localStorage.setItem(key, String(now));
    } catch {}
    pending = true;
    try {
      await fetch(
        location.hostname === "localhost" || location.hostname === "127.0.0.1"
          ? "http://localhost:3001/api/health"
          : endpoint,
        {
          cache: "no-store",
          credentials: "omit",
          signal: AbortSignal.timeout(90000),
        },
      );
    } catch {
    } finally {
      pending = false;
    }
  }
  ping();
  setInterval(ping, 300000);
  window.addEventListener("online", ping);
  window.addEventListener("pageshow", ping);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) ping();
  });
})();

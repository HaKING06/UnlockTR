// Bounded recovery for a missing release bundle, never for permission failures.
(() => {
  let recovering = false;
  function recover() {
    if (recovering || navigator.onLine === false) return;
    try {
      const key = "utrzone-release-recovery:" + location.pathname;
      const last = Number(sessionStorage.getItem(key)) || 0;
      if (Date.now() - last < 300000) return;
      sessionStorage.setItem(key, String(Date.now()));
    } catch {
      return;
    }
    recovering = true;
    setTimeout(() => location.reload(), 800);
  }
  window.addEventListener("vite:preloadError", recover);
  window.addEventListener(
    "error",
    (event) => {
      if (
        event.target?.tagName === "SCRIPT" &&
        event.target.type === "module" &&
        new URL(event.target.src, location.href).pathname.startsWith("/assets/")
      )
        recover();
    },
    true,
  );
})();

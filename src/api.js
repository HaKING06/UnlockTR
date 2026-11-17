const API = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3001/api"
    : "https://unlocktr-backend.onrender.com/api")
).replace(/\/$/, "");
export const ADMIN = import.meta.env.VITE_ADMIN_ROUTE_SLUG || "founder-console";
export const engines = ["Ren'Py", "Unity"];
export async function api(path, { token, body, method = "GET", signal } = {}) {
  const res = await fetch(API + path, {
    method,
    signal,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    const error = new Error(
      "Sunucuya şu an ulaşılamıyor. Biraz sonra tekrar dene.",
    );
    error.status = res.status;
    throw error;
  }
  if (!res.ok) {
    const error = new Error(data.error || "İşlem başarısız.");
    error.status = res.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

// Only public catalog data is cached: never member details or VIP URLs.
const CATALOG_KEY = "unlocktr-public-catalog-v2";
export function readCatalog() {
  try {
    const item = JSON.parse(localStorage.getItem(CATALOG_KEY) || "null");
    return item &&
      Date.now() - item.savedAt < 24 * 60 * 60 * 1000 &&
      Array.isArray(item.data?.games)
      ? item.data
      : null;
  } catch {
    return null;
  }
}
export function saveCatalog(data) {
  try {
    localStorage.setItem(
      CATALOG_KEY,
      JSON.stringify({ savedAt: Date.now(), data }),
    );
  } catch {}
}

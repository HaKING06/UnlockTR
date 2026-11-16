const API = (
  import.meta.env.VITE_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");
export const ADMIN = import.meta.env.VITE_ADMIN_ROUTE_SLUG || "founder-console";
export const engines = [
  "Ren'Py",
  "Unity",
  "RPG Maker",
  "Unreal Engine",
  "Godot",
  "Other",
];
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
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "İşlem başarısız.");
  return data;
}

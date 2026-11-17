export function readConsent() {
  try {
    const value = document.cookie
      .split("; ")
      .find((v) => v.startsWith("utrzone_consent="));
    return value
      ? JSON.parse(decodeURIComponent(value.split("=").slice(1).join("=")))
      : null;
  } catch {
    return null;
  }
}
export const preferencesAllowed = () => readConsent()?.preferences === true;
export function saveConsent(preferences) {
  const value = { v: 1, preferences, updated_at: new Date().toISOString() };
  document.cookie =
    "utrzone_consent=" +
    encodeURIComponent(JSON.stringify(value)) +
    "; Path=/; Max-Age=15552000; SameSite=Lax" +
    (location.protocol === "https:" ? "; Secure" : "");
  window.dispatchEvent(new CustomEvent("utrzone-consent", { detail: value }));
  return value;
}

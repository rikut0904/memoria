const LOGOUT_COOKIE_KEY = "memoria_logout";

export const signalLogout = () => {
  if (typeof document === "undefined") return;
  const ts = Date.now();
  document.cookie = `${LOGOUT_COOKIE_KEY}=${ts}; path=/; max-age=86400; samesite=lax`;
  return ts;
};

export const readLogoutSignal = (): number | null => {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LOGOUT_COOKIE_KEY}=`));
  if (!cookie) return null;
  const value = cookie.split("=")[1];
  const ts = Number(value);
  if (!Number.isFinite(ts)) return null;
  return ts;
};

const LOGOUT_COOKIE_KEY = "memoria_logout";

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

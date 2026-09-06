export const normalizeBackPath = (raw: string | null): string | null => {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;

  try {
    const url = new URL(raw, "http://local");
    const nested = url.searchParams.get("back-path");
    if (nested && nested.startsWith("/")) {
      const nestedUrl = new URL(nested, "http://local");
      // Drop deeper nesting.
      nestedUrl.searchParams.delete("back-path");
      url.searchParams.set("back-path", nestedUrl.pathname + nestedUrl.search);
    }
    return url.pathname + url.search;
  } catch {
    return raw;
  }
};

const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:3001";

export const buildLoginUrl = (currentPath: string) => {
  if (!currentPath) return `${AUTH_BASE_URL}/login`;
  let returnTo = currentPath;
  if (typeof window !== "undefined" && currentPath.startsWith("/")) {
    returnTo = `${window.location.origin}${currentPath}`;
  }
  return `${AUTH_BASE_URL}/login?return_to=${encodeURIComponent(returnTo)}`;
};

export const getCurrentPathWithQuery = () => {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
};

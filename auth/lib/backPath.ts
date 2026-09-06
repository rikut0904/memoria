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

export const buildLoginUrl = (currentPath: string) => {
  const normalized = normalizeBackPath(currentPath);
  if (!normalized) return "/login";
  return `/login?back-path=${encodeURIComponent(normalized)}`;
};

export const getCurrentPathWithQuery = () => {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
};

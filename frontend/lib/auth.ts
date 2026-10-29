const TOKEN_KEY = "memoria_token";

type AuthTokenProvider = () => Promise<string | null>;

let authTokenProvider: AuthTokenProvider | null = null;

export function setAuthTokenProvider(provider: AuthTokenProvider | null): void {
  authTokenProvider = provider;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
}

export async function getFreshAuthToken(): Promise<string | null> {
  if (authTokenProvider) {
    const token = await authTokenProvider();
    if (token) {
      setAuthToken(token);
      return token;
    }
    clearAuthToken();
    return null;
  }
  return getAuthToken();
}

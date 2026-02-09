const TOKEN_KEY = 'memoria_token'
const REFRESH_KEY = 'memoria_refresh_token'

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage.getItem(REFRESH_KEY)
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(REFRESH_KEY, token)
}

export function clearRefreshToken(): void {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(REFRESH_KEY)
}

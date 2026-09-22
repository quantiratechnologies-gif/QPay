/**
 * QPay Session Storage Service
 * Uses sessionStorage on web (falls back to in-memory on native/SSR).
 * On Capacitor native, @capacitor/preferences would be used instead,
 * but sessionStorage works correctly in the WebView.
 */

const MEM: Record<string, string> = {};

function store(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) return window.sessionStorage;
  } catch {}
  return null;
}

export const session = {
  set(key: string, value: string): void {
    const s = store();
    if (s) s.setItem(key, value);
    else MEM[key] = value;
  },
  get(key: string): string | null {
    const s = store();
    return s ? s.getItem(key) : (MEM[key] ?? null);
  },
  remove(key: string): void {
    const s = store();
    if (s) s.removeItem(key);
    else delete MEM[key];
  },
  clear(): void {
    const s = store();
    if (s) s.clear();
    else Object.keys(MEM).forEach((k) => delete MEM[k]);
  },
};

export const SESSION_KEYS = {
  ACCESS_TOKEN: 'qpay_access_token',
  USER: 'qpay_user',
} as const;

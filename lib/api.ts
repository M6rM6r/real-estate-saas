const API_BASE = '';
const SESSION_REFRESH_INTERVAL_MS = 10 * 60 * 1000;
let lastSessionRefreshAt = 0;

async function getToken(): Promise<string | null> {
  try {
    const { auth } = await import('@/lib/firebase');
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

async function refreshSessionCookieIfNeeded(token: string | null) {
  if (!token || typeof window === 'undefined') return;
  const now = Date.now();
  if (now - lastSessionRefreshAt < SESSION_REFRESH_INTERVAL_MS) return;
  lastSessionRefreshAt = now;

  try {
    await fetch(`${API_BASE}/api/auth/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
      credentials: 'same-origin',
    });
  } catch {
    // best-effort refresh only
  }
}

export async function authFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  void refreshSessionCookieIfNeeded(token);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function publicFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

import { store } from '../store';
import { clearAuth } from '../features/authSlice';

const BASE_URL = (import.meta.env.VITE_BACKEND_BASE_URL || '').replace(/\/$/, '');

let refreshInFlight: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) return true;
        return false;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const url = input.startsWith('http') ? input : `${BASE_URL}${input.startsWith('/') ? '' : '/'}${input}`;
  const merged: RequestInit = {
    credentials: 'include',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  };

  let res: Response;
  try {
    res = await fetch(url, merged);
  } catch (e) {
    throw new Error('Network error. Please check your connection and try again.');
  }

  if (res.status === 401 || res.status === 419) {
    const refreshed = await doRefresh();
    if (refreshed) {
      try {
        res = await fetch(url, merged);
      } catch {
        throw new Error('Network error after token refresh. Please try again.');
      }
    } else {
      // refresh failed, clear auth and let UI redirect
      store.dispatch(clearAuth());
    }
  }
  return res;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path, { method: 'GET' });
  if (!res.ok) throw await parseApiError(res);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body?: any): Promise<T> {
  const res = await apiFetch(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw await parseApiError(res);
  return res.json() as Promise<T>;
}

async function parseApiError(res: Response): Promise<Error> {
  try {
    const data = await res.json();
    const msg = data?.error || data?.message || `Request failed with status ${res.status}`;
    return new Error(msg);
  } catch {
    return new Error(`Request failed with status ${res.status}`);
  }
}

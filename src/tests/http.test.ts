import test from 'node:test';
import assert from 'node:assert/strict';
import { apiFetch } from '../services/http';

// simple fetch mock with counters
let callCount = 0;
const originalFetch = globalThis.fetch;

function mockFetch(handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) {
  // @ts-expect-error
  globalThis.fetch = handler;
}

test('apiFetch retries once after refresh on 401', async (t) => {
  t.after(() => { globalThis.fetch = originalFetch; });

  callCount = 0;
  mockFetch(async (input, init) => {
    callCount++;
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/auth/refresh')) {
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (callCount === 1) {
      return new Response('{"error":"unauthorized"}', { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response('{"ok":true}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  });

  const res = await apiFetch('/protected', { method: 'GET' });
  assert.equal(res.status, 200);
});

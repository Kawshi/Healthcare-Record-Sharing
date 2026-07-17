import test from 'node:test';
import assert from 'node:assert/strict';
import reducer, { setAuth, clearAuth, setLastWallet, type AuthUser } from '../features/authSlice';

const user: AuthUser = { id: 'u1', name: 'Alice', role: 'patient', account: 'rABC' };

test('auth slice setAuth/clearAuth', () => {
  const s1 = reducer(undefined, setAuth({ user, expiresAt: 1000 }));
  assert.equal(s1.isAuthenticated, true);
  assert.equal(s1.user?.name, 'Alice');
  assert.equal(s1.expiresAt, 1000);

  const s2 = reducer(s1, clearAuth());
  assert.equal(s2.isAuthenticated, false);
  assert.equal(s2.user, undefined);
});

test('auth slice remembers last wallet', () => {
  const s1 = reducer(undefined, setLastWallet('gemwallet'));
  assert.equal(s1.lastWallet, 'gemwallet');
});

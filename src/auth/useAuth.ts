import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { apiPost } from '../services/http';
import { clearAuth, setAuth, setAuthError, setAuthLoading, setExpiry, setLastWallet } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    gemWallet?: {
      isInstalled?: () => boolean | Promise<boolean>;
      getAddress?: () => Promise<string>;
      signMessage?: (message: string) => Promise<any>;
    };
  }
}

interface ChallengeResponse {
  message: string;
  expiresAt?: number;
  error?: string;
}

interface VerifyResponse {
  user: { id: string; name: string; role: string; account: string };
  expiresAt?: number;
}

interface XummCreateResponse {
  qrUrl: string;
  deepLinkUrl?: string;
  payloadId: string;
  expiresAt?: number;
}

interface XummStatusResponse {
  status: 'pending' | 'signed' | 'rejected' | 'expired';
  signature?: string;
  account?: string;
}

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((s: RootState) => (s as any).auth);

  // schedule silent refresh a minute before expiry (server will extend cookie)
  useEffect(() => {
    if (!auth?.isAuthenticated || !auth?.expiresAt) return;
    const now = Date.now();
    const delta = Math.max(1000, auth.expiresAt - now - 60_000); // 60s early
    const id = setTimeout(() => {
      // touch refresh endpoint via a harmless call
      void apiPost('/auth/refresh').catch(() => {
        dispatch(clearAuth());
      });
    }, delta);
    return () => clearTimeout(id);
  }, [auth?.isAuthenticated, auth?.expiresAt, dispatch]);

  const requestChallenge = useCallback(async (account: string): Promise<ChallengeResponse> => {
    try {
      dispatch(setAuthLoading(true));
      const data = await apiPost<ChallengeResponse>('/auth/challenge', { account });
      if (data?.error) throw new Error(data.error);
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch auth challenge';
      dispatch(setAuthError(msg));
      throw new Error(msg);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch]);

  const verifySignature = useCallback(async (params: { account: string; message: string; signature: string; wallet: 'gemwallet' | 'xumm' | 'manual' }) => {
    try {
      dispatch(setAuthLoading(true));
      const data = await apiPost<VerifyResponse>('/auth/verify', params);
      dispatch(setAuth({ user: data.user, expiresAt: data.expiresAt }));
      if (data.expiresAt) dispatch(setExpiry(data.expiresAt));
      dispatch(setLastWallet(params.wallet));
      navigate('/');
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Signature verification failed';
      dispatch(setAuthError(msg));
      throw new Error(msg);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch, navigate]);

  const createXummSign = useCallback(async (account: string, message: string): Promise<XummCreateResponse> => {
    try {
      dispatch(setAuthLoading(true));
      const data = await apiPost<XummCreateResponse>('/auth/xumm/create-sign', { account, message });
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to create Xaman sign request';
      dispatch(setAuthError(msg));
      throw new Error(msg);
    } finally {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch]);

  const pollXummStatus = useCallback(async (payloadId: string, signal?: AbortSignal): Promise<XummStatusResponse> => {
    const start = Date.now();
    while (Date.now() - start < 5 * 60_000) { // up to 5 minutes
      if (signal?.aborted) throw new Error('Cancelled');
      try {
        const data = await apiPost<XummStatusResponse>('/auth/xumm/status', { payloadId });
        if (data.status === 'signed' || data.status === 'rejected' || data.status === 'expired') return data;
      } catch {
        // ignore transient errors
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    return { status: 'expired' };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiPost('/auth/logout');
    } catch {
      // ignore, proceed to clear client state
    } finally {
      dispatch(clearAuth());
      navigate('/signin');
    }
  }, [dispatch, navigate]);

  return {
    auth,
    requestChallenge,
    verifySignature,
    createXummSign,
    pollXummStatus,
    signOut,
  };
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setAuthError, setAuthLoading, setLastWallet } from '../features/authSlice';

function useWalletDetection() {
  const hasGemWallet = typeof window !== 'undefined' && !!window.gemWallet;
  return { hasGemWallet };
}

export default function SignInPage() {
  const { requestChallenge, verifySignature, createXummSign, pollXummStatus } = useAuth();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s: RootState) => (s as any).auth) as any;
  const { hasGemWallet } = useWalletDetection();
  const allowManual = (import.meta.env.VITE_WALLET_ALLOW_MANUAL === 'true') && (import.meta.env.MODE !== 'prod');

  const [account, setAccount] = useState('');
  const [message, setMessage] = useState('');
  const [xummQrUrl, setXummQrUrl] = useState<string | undefined>();
  const [xummDeepLink, setXummDeepLink] = useState<string | undefined>();
  const [xummPayloadId, setXummPayloadId] = useState<string | undefined>();
  const [step, setStep] = useState<'select' | 'challenge' | 'signing' | 'verify' | 'done'>('select');
  const [selectedWallet, setSelectedWallet] = useState<'gemwallet' | 'xumm' | 'manual' | null>(null);

  const firstBtnRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => { firstBtnRef.current?.focus(); }, []);

  const canContinue = useMemo(() => {
    if (!selectedWallet) return false;
    if (!account) return false;
    if (selectedWallet === 'manual' && !message) return false;
    return true;
  }, [selectedWallet, account, message]);

  const handleChooseGem = async () => {
    setSelectedWallet('gemwallet');
    dispatch(setLastWallet('gemwallet'));
    dispatch(setAuthError(undefined));
    try {
      let addr = account;
      if (!addr && window.gemWallet?.getAddress) {
        try {
          addr = await window.gemWallet.getAddress();
          setAccount(addr);
        } catch {
          // ignore, user can enter manually
        }
      }
      if (!addr) return;
      const ch = await requestChallenge(addr);
      setMessage(ch.message);
      setStep('challenge');
      await handleGemSign(addr, ch.message);
    } catch (e) {
      // error already set
    }
  };

  const handleGemSign = async (addr: string, msg: string) => {
    if (!window.gemWallet?.signMessage) {
      dispatch(setAuthError('GemWallet signMessage is not available. Please update or reinstall the extension.'));
      return;
    }
    dispatch(setAuthLoading(true));
    try {
      const signed = await window.gemWallet.signMessage(msg);
      const signature: string = signed?.signedMessage || signed?.signature || '';
      if (!signature) throw new Error('Wallet did not return a signature');
      await verifySignature({ account: addr, message: msg, signature, wallet: 'gemwallet' });
      setStep('done');
    } catch (e) {
      dispatch(setAuthError(e instanceof Error ? e.message : 'Failed to sign with GemWallet'));
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const handleChooseXumm = async () => {
    setSelectedWallet('xumm');
    dispatch(setLastWallet('xumm'));
    dispatch(setAuthError(undefined));
    if (!account) return;
    try {
      const ch = await requestChallenge(account);
      setMessage(ch.message);
      setStep('challenge');
      const created = await createXummSign(account, ch.message);
      setXummQrUrl(created.qrUrl);
      setXummDeepLink(created.deepLinkUrl);
      setXummPayloadId(created.payloadId);
      setStep('signing');
      const ctrl = new AbortController();
      const result = await pollXummStatus(created.payloadId, ctrl.signal);
      if (result.status === 'signed' && result.signature) {
        await verifySignature({ account: account, message: ch.message, signature: result.signature, wallet: 'xumm' });
        setStep('done');
      } else if (result.status === 'rejected') {
        dispatch(setAuthError('Signing request was rejected in Xaman.'));
      } else if (result.status === 'expired') {
        dispatch(setAuthError('Signing request expired. Please try again.'));
      }
    } catch (e) {
      dispatch(setAuthError(e instanceof Error ? e.message : 'Xaman signing failed'));
    }
  };

  const handleManual = async () => {
    setSelectedWallet('manual');
    dispatch(setLastWallet('manual'));
    dispatch(setAuthError(undefined));
    if (!account) return;
    try {
      const ch = await requestChallenge(account);
      setMessage(ch.message);
      setStep('challenge');
    } catch {
      // handled in hook
    }
  };

  const handleManualVerify = async () => {
    const signature = (document.getElementById('manual-signature') as HTMLTextAreaElement | null)?.value?.trim();
    if (!signature) {
      dispatch(setAuthError('Please paste a signature to continue.'));
      return;
    }
    try {
      await verifySignature({ account, message, signature, wallet: 'manual' });
      setStep('done');
    } catch {
      // error shown
    }
  };

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Sign in</h1>
      <p className="mb-6 text-sm text-gray-600">Connect a supported XRPL wallet to authenticate. We will request a signature of a one-time message; no funds are moved.</p>

      <label htmlFor="xrpl-account" className="block text-sm font-medium text-gray-700">XRPL Account (r...)</label>
      <input
        id="xrpl-account"
        value={account}
        onChange={(e) => setAccount(e.target.value)}
        placeholder="r..."
        className="mb-4 mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-500"
        autoComplete="off"
      />

      <div className="space-y-3" role="group" aria-label="Choose a wallet">
        <button
          ref={firstBtnRef}
          onClick={() => void handleChooseGem()}
          disabled={!hasGemWallet || !account || loading}
          className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring focus:ring-blue-500 ${hasGemWallet ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'}`}
          aria-disabled={!hasGemWallet || !account || loading}
        >
          {hasGemWallet ? 'Connect GemWallet' : 'GemWallet not detected'}
        </button>

        <button
          onClick={() => void handleChooseXumm()}
          disabled={!account || loading}
          className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring focus:ring-blue-500"
        >
          Connect Xaman (XUMM)
        </button>

        {allowManual && (
          <button
            onClick={() => void handleManual()}
            disabled={!account || loading}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring focus:ring-blue-500"
          >
            Developer: Manual signature
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</div>
      )}

      {message && selectedWallet === 'manual' && (
        <div className="mt-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Challenge message</label>
            <textarea className="mt-1 w-full rounded-md border p-2 text-xs" value={message} rows={4} readOnly />
          </div>
          <div>
            <label htmlFor="manual-signature" className="block text-sm font-medium text-gray-700">Paste signature</label>
            <textarea id="manual-signature" className="mt-1 w-full rounded-md border p-2 text-xs" rows={4} placeholder="Paste signature from your signer here"></textarea>
          </div>
          <button
            onClick={() => void handleManualVerify()}
            disabled={!canContinue || loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-500"
          >
            Verify and Sign in
          </button>
        </div>
      )}

      {selectedWallet === 'xumm' && step === 'signing' && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-gray-700">Scan the QR with Xaman or open the deep link to approve the signature request.</p>
          {xummQrUrl && (
            <div className="flex items-center justify-center rounded-lg border p-4">
              <img src={xummQrUrl} alt="Xaman QR code" className="h-56 w-56" />
            </div>
          )}
          {xummDeepLink && (
            <a
              href={xummDeepLink}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Open in Xaman
            </a>
          )}
        </div>
      )}

      {loading && (
        <div className="mt-4 text-sm text-gray-600" aria-live="polite">Processing...</div>
      )}
    </div>
  );
}

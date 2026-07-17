import { useEffect, useState } from 'react';
import ContractService from './services/contract-service';
import AppRoutes from './routes/routes';
import Snackbar from './components/Shared/Snackbar';
import Loading from './components/Shared/Loading';
import TopLevelAuthGate from './auth/TopLevelAuthGate';
import { useLocation } from 'react-router-dom';
import Header from './components/Layout/Header';
import { useSelector } from 'react-redux';
import type { RootState } from './store';

export default function App() {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const loc = useLocation();
  const auth = useSelector((s: RootState) => (s as any).auth);

  useEffect(() => {
    const init = async () => {
      try { await ContractService.getInstance().init(); setReady(true); }
      catch (e) { setErr(e instanceof Error ? e.message : 'Failed to init HotPocket client'); }
    }; void init();
  }, []);

  if (err) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg rounded-2xl bg-white p-6 shadow">
        <h1 className="text-lg font-semibold text-rose-600">Initialization failed</h1>
        <p className="mt-2 text-sm text-gray-600">{err}</p>
      </div>
    </div>
  );

  if (!ready) return <Loading text="Connecting to contract..." />;

  const onSignInRoute = loc.pathname === '/signin';

  return (
    <>
      <TopLevelAuthGate />
      {!onSignInRoute && auth?.isAuthenticated && <Header />}
      {onSignInRoute ? (
        // Lazy import avoided to keep bundle simple
        (await import('./pages/SignIn')).default ? null : null
      ) : (
        <AppRoutes />
      )}
      {onSignInRoute && (await import('./pages/SignIn')).default && (() => {
        const Comp = (await import('./pages/SignIn')).default; return <Comp />;
      })()}
      <Snackbar />
    </>
  );
}

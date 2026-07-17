import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useAuth } from '../../auth/useAuth';

export default function Header() {
  const { signOut } = useAuth();
  const auth = useSelector((s: RootState) => (s as any).auth);
  if (!auth?.isAuthenticated) return null;
  const role = auth?.user?.role ?? 'user';
  const name = auth?.user?.name ?? '';

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Signed in as</span>
          <span className="font-semibold text-gray-900">{name}</span>
          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{role}</span>
        </div>
        <button
          onClick={() => void signOut()}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus-visible:ring focus-visible:ring-blue-500"
          aria-label="Sign out"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

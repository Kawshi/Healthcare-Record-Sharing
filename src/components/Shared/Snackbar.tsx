import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { hideSnackbar } from '../../features/snackbarSlice';

export default function Snackbar() {
  const dispatch = useDispatch();
  const { open, message, severity } = useSelector((s: RootState) => s.snackbar);
  if (!open) return null;
  const bg = severity === 'success' ? 'bg-emerald-600' : severity === 'error' ? 'bg-rose-600' : 'bg-blue-600';
  return (
    <div className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-white shadow-lg ${bg}`} role="alert" aria-live="polite">
      <span className="text-sm">{message}</span>
      <button onClick={() => dispatch(hideSnackbar())} className="ml-3 text-white/90 underline">Dismiss</button>
    </div>
  );
}

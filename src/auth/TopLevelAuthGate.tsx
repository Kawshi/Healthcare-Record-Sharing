import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useLocation, useNavigate } from 'react-router-dom';

export default function TopLevelAuthGate() {
  const auth = useSelector((s: RootState) => (s as any).auth);
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const path = loc.pathname;
    if (!auth?.isAuthenticated && path !== '/signin') {
      navigate('/signin', { replace: true });
    }
    if (auth?.isAuthenticated && path === '/signin') {
      navigate('/', { replace: true });
    }
  }, [auth?.isAuthenticated, loc.pathname, navigate]);

  return null;
}

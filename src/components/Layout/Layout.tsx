import { Outlet, Link, useLocation } from 'react-router-dom';

export default function Layout() {
  const loc = useLocation();
  const link = (to: string, label: string) => (
    <Link to={to} className={`px-3 py-2 rounded-lg text-sm font-medium ${loc.pathname === to ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>{label}</Link>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold text-gray-900">Healthcare Record Sharing</Link>
          <div className="flex gap-2">
            {link('/', 'Dashboard')}
            {link('/profile', 'Profile')}
            {link('/documents', 'Documents')}
            {link('/access', 'Sharing')}
            {link('/records', 'Records')}
            {link('/prescriptions', 'Prescriptions')}
            {link('/lab', 'Lab')}
            {link('/audit', 'Audit')}
            {link('/notifications', 'Notifications')}
            {link('/admin', 'Admin')}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-100 py-6 text-center text-sm text-gray-600">© {new Date().getFullYear()} Healthcare Record Sharing. All rights reserved.</footer>
    </div>
  );
}

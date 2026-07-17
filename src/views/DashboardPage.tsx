import { useEffect, useState } from 'react';
import ApiService from '../services/api-service';
import type { MeInfo } from '../types';

export default function DashboardPage() {
  const [me, setMe] = useState<MeInfo | null>(null);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try { const m = await ApiService.getInstance().getMe(); setMe(m); }
      catch (e) { setErr(e instanceof Error ? e.message : 'Failed to load profile'); }
    }; void load();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome</h1>
        {me && (
          <p className="mt-2 text-gray-700">Signed in as <span className="font-mono">{me.UserId}</span> — role: <span className="font-semibold">{me.Role}</span></p>
        )}
        {err && <p className="mt-2 text-rose-600">{err}</p>}
        <p className="mt-4 text-sm text-gray-500">This portal enables secure, consented sharing of healthcare records. Never share your passphrase. AI outputs are informational only and not medical advice.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {['Profile','Documents','Sharing','Records','Prescriptions','Lab','Audit','Notifications','Admin'].map((t) => (
          <a key={t} href={`/${t.toLowerCase()}`} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
            <h3 className="text-lg font-semibold text-gray-900">{t}</h3>
            <p className="mt-1 text-sm text-gray-600">Go to {t}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

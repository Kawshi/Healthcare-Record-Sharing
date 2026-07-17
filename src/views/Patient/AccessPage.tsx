import { useEffect, useState } from 'react';
import type React from 'react';
import ApiService from '../../services/api-service';
import type { AccessGrantItem } from '../../types';

export default function AccessPage() {
  const [patientId, setPatientId] = useState('');
  const [grants, setGrants] = useState<AccessGrantItem[]>([]);
  const [grantee, setGrantee] = useState('');
  const [scopes, setScopes] = useState('read_profile,read_records,read_docs');
  const [expiresAt, setExpiresAt] = useState('');

  const load = async (pid: string) => { const g = await ApiService.getInstance().listGrants(pid); setGrants(g); };

  useEffect(() => { (async () => { const me = await ApiService.getInstance().getMe(); setPatientId(me.UserId); await load(me.UserId); })(); }, []);

  const grant = async () => {
    await ApiService.getInstance().grantAccess({ granteeUserId: grantee, scopes: scopes.split(',').map((s: string) => s.trim()).filter(Boolean), expiresAt: expiresAt || null });
    await load(patientId);
  };
  const revoke = async (id: number) => { await ApiService.getInstance().revokeAccess(id); await load(patientId); };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Sharing Controls</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Grantee userId" value={grantee} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGrantee(e.target.value)} />
          <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Scopes (comma-separated)" value={scopes} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScopes(e.target.value)} />
          <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm" type="datetime-local" value={expiresAt} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiresAt(e.target.value)} />
        </div>
        <button onClick={grant} className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white">Grant Access</button>
        <p className="mt-2 text-xs text-gray-500">Never share your private keys. Grants are revocable and time-limited.</p>
      </div>
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Active Grants</h3>
        <ul className="mt-3 divide-y divide-gray-100">
          {grants.map((g: AccessGrantItem) => (
            <li key={g.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{g.granteeUserId} — {g.scopes.join(', ')}</p>
                <p className="text-xs text-gray-500">Issued: {g.issuedAt ?? '-'} | Expires: {g.expiresAt ?? '-'} | Revoked: {g.revokedAt ?? '-'}</p>
              </div>
              <button onClick={() => revoke(g.id)} className="rounded bg-rose-600 px-3 py-1.5 text-xs text-white">Revoke</button>
            </li>
          ))}
          {grants.length === 0 && <li className="py-3 text-sm text-gray-500">No grants yet.</li>}
        </ul>
      </div>
    </div>
  );
}

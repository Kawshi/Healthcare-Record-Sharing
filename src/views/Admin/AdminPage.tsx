import { useState } from 'react';
import type React from 'react';
import ApiService from '../../services/api-service';

export default function AdminPage() {
  const [userId, setUserId] = useState('');
  const [msg, setMsg] = useState('');

  const approve = async () => { try { const r = await ApiService.getInstance().adminApproveProvider(userId); setMsg(`Approved ${r.approved}`); } catch (e) { setMsg(e instanceof Error ? e.message : 'Error'); } };
  const suspend = async () => { try { const r = await ApiService.getInstance().adminSuspendUser(userId); setMsg(`Suspended ${r.suspended}`); } catch (e) { setMsg(e instanceof Error ? e.message : 'Error'); } };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Admin</h2>
        <div className="mt-3 flex gap-2">
          <input className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="UserId" value={userId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserId(e.target.value)} />
          <button onClick={approve} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white">Approve</button>
          <button onClick={suspend} className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white">Suspend</button>
        </div>
        {msg && <p className="mt-2 text-sm text-gray-700">{msg}</p>}
      </div>
    </div>
  );
}

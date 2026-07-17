import { useEffect, useState } from 'react';
import type React from 'react';
import ApiService from '../../services/api-service';
import type { Paged, LabOrderListItem, LabResultListItem } from '../../types';

export default function LabPage() {
  const [patientId, setPatientId] = useState('');
  const [tests, setTests] = useState('["CBC"]');
  const [orders, setOrders] = useState<Paged<LabOrderListItem> | null>(null);
  const [results, setResults] = useState<Paged<LabResultListItem> | null>(null);

  const load = async (pid: string) => {
    const o = await ApiService.getInstance().listLabOrders(pid); setOrders(o);
    const r = await ApiService.getInstance().listLabResults(pid); setResults(r);
  };

  useEffect(() => { (async () => { const me = await ApiService.getInstance().getMe(); setPatientId(me.UserId); await load(me.UserId); })(); }, []);

  const create = async () => { try { const t = JSON.parse(tests) as unknown[]; await ApiService.getInstance().createLabOrder({ patientId, tests: t }); await load(patientId); } catch { alert('Tests must be JSON array'); } };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Lab Orders</h2>
          <ul className="mt-3 divide-y divide-gray-100">
            {(orders?.data ?? []).map((o: LabOrderListItem) => (
              <li key={o.OrderId} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{o.Status}</p>
                  <p className="text-xs text-gray-500">{o.CreatedAt}</p>
                </div>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">{o.OrderId}</span>
              </li>
            ))}
            {(!orders || orders.data.length === 0) && <li className="py-3 text-sm text-gray-500">No lab orders.</li>}
          </ul>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Tests (JSON array)</label>
            <textarea className="mt-1 h-28 w-full rounded-lg border border-gray-300 p-2 text-sm" value={tests} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTests(e.target.value)} />
            <button onClick={create} className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Create Order</button>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Lab Results</h2>
          <ul className="mt-3 divide-y divide-gray-100">
            {(results?.data ?? []).map((r: LabResultListItem) => (
              <li key={r.ResultId} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Released: {r.ReleasedAt ?? '-'}</p>
                </div>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">{r.ResultId}</span>
              </li>
            ))}
            {(!results || results.data.length === 0) && <li className="py-3 text-sm text-gray-500">No lab results.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import type React from 'react';
import ApiService from '../../services/api-service';
import type { Paged, PrescriptionListItem } from '../../types';
import AIPanel from '../../components/AI/AIPanel';

export default function PrescriptionsPage() {
  const [patientId, setPatientId] = useState('');
  const [items, setItems] = useState('[{"drug":"Example","dose":"10mg"}]');
  const [list, setList] = useState<Paged<PrescriptionListItem> | null>(null);

  useEffect(() => { (async () => { const me = await ApiService.getInstance().getMe(); setPatientId(me.UserId); const l = await ApiService.getInstance().listPrescriptions(me.UserId); setList(l); })(); }, []);

  const issue = async () => {
    try { const it = JSON.parse(items) as unknown[]; await ApiService.getInstance().issuePrescription({ patientId, items: it }); const l = await ApiService.getInstance().listPrescriptions(patientId); setList(l); }
    catch { alert('Items must be valid JSON array'); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Prescriptions</h2>
            <ul className="mt-3 divide-y divide-gray-100">
              {(list?.data ?? []).map((r: PrescriptionListItem) => (
                <li key={r.RxId} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.Status}</p>
                    <p className="text-xs text-gray-500">{r.CreatedAt}</p>
                  </div>
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">{r.RxId}</span>
                </li>
              ))}
              {(!list || list.data.length === 0) && <li className="py-3 text-sm text-gray-500">No prescriptions yet.</li>}
            </ul>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Issue Prescription</h3>
            <textarea className="mt-2 h-32 w-full rounded-lg border border-gray-300 p-2 text-sm" value={items} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setItems(e.target.value)} />
            <button onClick={issue} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Issue</button>
          </div>
        </div>
        <AIPanel contextId={{}} />
      </div>
    </div>
  );
}

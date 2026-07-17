import { useEffect, useState } from 'react';
import type React from 'react';
import ApiService from '../../services/api-service';
import type { Paged, RecordListItem } from '../../types';
import AIPanel from '../../components/AI/AIPanel';

export default function RecordsPage() {
  const [patientId, setPatientId] = useState('');
  const [list, setList] = useState<Paged<RecordListItem> | null>(null);
  const [type, setType] = useState('note');
  const [content, setContent] = useState('{}');

  const load = async (pid: string) => { const l = await ApiService.getInstance().listRecords(pid); setList(l); };

  useEffect(() => { (async () => { const me = await ApiService.getInstance().getMe(); setPatientId(me.UserId); await load(me.UserId); })(); }, []);

  const create = async () => {
    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      await ApiService.getInstance().createRecord({ patientId, type, content: parsed });
      await load(patientId);
    } catch { alert('Content must be valid JSON'); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Medical Records</h2>
            <ul className="mt-3 divide-y divide-gray-100">
              {(list?.data ?? []).map((r: RecordListItem) => (
                <li key={r.RecordId} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.Type}</p>
                    <p className="text-xs text-gray-500">v{r.Version} — {r.CreatedAt}</p>
                  </div>
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">{r.RecordId}</span>
                </li>
              ))}
              {(!list || list.data.length === 0) && <li className="py-3 text-sm text-gray-500">No records yet.</li>}
            </ul>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Create Record</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={type} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setType(e.target.value)} />
              <textarea className="md:col-span-2 h-32 rounded-lg border border-gray-300 p-2 text-sm" value={content} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)} />
            </div>
            <button onClick={create} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Create</button>
          </div>
        </div>
        <AIPanel contextId={{}} />
      </div>
    </div>
  );
}

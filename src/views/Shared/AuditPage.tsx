import { useEffect, useState } from 'react';
import ApiService from '../../services/api-service';
import type { Paged, AuditListItem } from '../../types';

export default function AuditPage() {
  const [patientId, setPatientId] = useState('');
  const [list, setList] = useState<Paged<AuditListItem> | null>(null);

  useEffect(() => { (async () => { const me = await ApiService.getInstance().getMe(); setPatientId(me.UserId); const l = await ApiService.getInstance().listAuditLogs({ patientId: me.UserId }); setList(l); })(); }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Audit Trail</h2>
        <ul className="mt-3 divide-y divide-gray-100">
          {(list?.data ?? []).map((i: AuditListItem) => (
            <li key={i.LogId} className="py-3">
              <p className="text-sm text-gray-900">{i.Timestamp} — {i.ActorUserId} {i.Action} {i.TargetType}:{i.TargetId}</p>
            </li>
          ))}
          {(!list || list.data.length === 0) && <li className="py-3 text-sm text-gray-500">No log entries.</li>}
        </ul>
        <p className="mt-2 text-xs text-gray-500">These entries are an immutable record of actions in the contract.</p>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import type React from 'react';
import ApiService from '../../services/api-service';
import type { PatientProfile } from '../../types';

export default function ProfilePage() {
  const [patientId, setPatientId] = useState<string>('');
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const me = await ApiService.getInstance().getMe();
      setPatientId(me.UserId);
      try {
        const p = await ApiService.getInstance().getPatientProfile(me.UserId);
        setProfile(p);
        setName((p.demographics?.name as string) || '');
      } catch { /* ignore when not found */ }
    };
    void load();
  }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSaving(true);
    try {
      await ApiService.getInstance().upsertPatientProfile({ demographics: { name } });
      const updated = await ApiService.getInstance().getPatientProfile(patientId);
      setProfile(updated);
    } finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Patient Profile</h2>
        <form onSubmit={save} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Jane Doe" />
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
        {profile && <pre className="mt-4 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700">{JSON.stringify(profile, null, 2)}</pre>}
      </div>
    </div>
  );
}

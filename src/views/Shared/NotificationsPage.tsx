import { useEffect, useState } from 'react';
import ApiService from '../../services/api-service';
import type { NotificationItem } from '../../types';

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);

  const load = async () => { const n = await ApiService.getInstance().listNotifications(); setItems(n); };

  useEffect(() => { void load(); }, []);

  const markRead = async (id: string) => { await ApiService.getInstance().markNotificationRead(id); await load(); };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <ul className="mt-3 divide-y divide-gray-100">
          {items.map((n: NotificationItem) => (
            <li key={n.NotificationId} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{n.Type}</p>
                <p className="text-xs text-gray-500">{n.CreatedAt}</p>
              </div>
              {n.ReadAt ? <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">Read</span> : (
                <button onClick={() => markRead(n.NotificationId)} className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white">Mark read</button>
              )}
            </li>
          ))}
          {items.length === 0 && <li className="py-3 text-sm text-gray-500">No notifications.</li>}
        </ul>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import type React from 'react';
import ApiService from '../../services/api-service';
import type { DocumentListItem, Paged } from '../../types';
import { aesGcmEncryptBytes, importAesKey, toBase64 } from '../../utils/crypto';
import AIPanel from '../../components/AI/AIPanel';

export default function DocumentsPage() {
  const [patientId, setPatientId] = useState('');
  const [list, setList] = useState<Paged<DocumentListItem> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const init = async () => {
      const me = await ApiService.getInstance().getMe();
      setPatientId(me.UserId);
      const l = await ApiService.getInstance().listDocuments(me.UserId);
      setList(l);
    }; void init();
  }, []);

  const upload = async () => {
    if (!file || !patientId) return;
    setBusy(true); setStatus('Preparing encryption...');
    try {
      const buf = await file.arrayBuffer();
      const dekRaw = crypto.getRandomValues(new Uint8Array(32)).buffer; // AES-256
      const key = await importAesKey(dekRaw);
      const { iv, ciphertext } = await aesGcmEncryptBytes(buf, key);
      const meta = { enc: 'AES-256-GCM', iv_b64: toBase64(iv), note: 'client-encrypted' };
      const initRes = await ApiService.getInstance().uploadDocumentInit({ patientId, kind: 'file', metadata: meta, size: (ciphertext as ArrayBuffer).byteLength });
      const sessionId = initRes.sessionId;
      const MAX = 1024 * 256; // 256KB per chunk
      const bytes = new Uint8Array(ciphertext);
      let offset = 0; let part = 0; let received = 0;
      while (offset < bytes.length) {
        const chunk = bytes.slice(offset, Math.min(offset + MAX, bytes.length));
        const b64 = toBase64(chunk);
        setStatus(`Uploading chunk ${++part}...`);
        const r = await ApiService.getInstance().uploadDocumentChunk({ sessionId, chunk: b64 });
        received = r.received;
        offset += chunk.length;
      }
      setStatus('Finalizing...');
      const fin = await ApiService.getInstance().uploadDocumentFinalize({ sessionId });
      setStatus(`Uploaded ${received} bytes, docId=${fin.docId}`);
      const l = await ApiService.getInstance().listDocuments(patientId);
      setList(l);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Upload failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Encrypted Document Uploader</h2>
            <p className="mt-1 text-sm text-gray-600">Files are encrypted in your browser with AES-256-GCM before uploading. Only ciphertext is stored.</p>
            <div className="mt-3 flex items-center gap-3">
              <input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null)} aria-label="Choose file" />
              <button onClick={upload} disabled={!file || busy} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">{busy ? 'Uploading...' : 'Upload'}</button>
            </div>
            {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">My Documents</h3>
            <ul className="mt-3 divide-y divide-gray-100">
              {(list?.data ?? []).map((d: DocumentListItem) => (
                <li key={d.DocId} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{d.Kind}</p>
                    <p className="text-xs text-gray-500">{d.CreatedAt}</p>
                  </div>
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">{d.DocId}</span>
                </li>
              ))}
              {(!list || list.data.length === 0) && <li className="py-3 text-sm text-gray-500">No documents yet.</li>}
            </ul>
          </div>
        </div>
        <AIPanel contextId={{}} />
      </div>
    </div>
  );
}

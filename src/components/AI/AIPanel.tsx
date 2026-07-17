import { useState } from 'react';
import type React from 'react';
import ApiService from '../../services/api-service';

export default function AIPanel({ contextId }: { contextId: { recordId?: string; docId?: string } }) {
  const [summary, setSummary] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [interactions, setInteractions] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  const doSummarize = async () => {
    setLoading(true);
    try { const res = await ApiService.getInstance().aiSummarize(contextId); setSummary(res.summary); }
    finally { setLoading(false); }
  };
  const doQnA = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try { const res = await ApiService.getInstance().aiHealthQnA(question.trim()); setAnswer(res.answer); }
    finally { setLoading(false); }
  };
  const doInteractions = async () => {
    setLoading(true);
    try { const res = await ApiService.getInstance().aiMedicationInteractions([]); setInteractions(res.interactions); }
    finally { setLoading(false); }
  };

  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-4" aria-label="AI assistant">
      <h3 className="text-base font-semibold text-gray-900">AI Assistant</h3>
      <p className="mt-1 text-xs text-gray-500">Outputs are informational only and not medical advice.</p>
      <div className="mt-3 flex gap-2">
        <button onClick={doSummarize} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white" disabled={loading}>Summarize</button>
        <button onClick={doInteractions} className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm text-white" disabled={loading}>Interactions</button>
      </div>
      {summary && <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700"><strong>Summary:</strong> {summary}</div>}
      {interactions && Array.isArray(interactions) && interactions.length > 0 && (
        <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
          <strong>Potential interactions:</strong>
          <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(interactions, null, 2)}</pre>
        </div>
      )}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700" htmlFor="qna-q">Health Q&A</label>
        <input id="qna-q" value={question} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Ask a question..." />
        <div className="mt-2">
          <button onClick={doQnA} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white" disabled={loading || !question.trim()}>Ask</button>
        </div>
        {answer && <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700"><strong>Answer:</strong> {answer}</div>}
      </div>
    </aside>
  );
}

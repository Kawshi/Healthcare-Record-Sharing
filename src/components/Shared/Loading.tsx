import { Loader2 } from 'lucide-react';

export default function Loading({ text = 'Loading...', heightClass = 'h-64' }: { text?: string; heightClass?: string }) {
  return (
    <div className={`flex items-center justify-center ${heightClass}`} role="status" aria-live="polite">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
}

import { AlertCircle } from 'lucide-react';

export function ErrorNotice({ message, onRetry }) {
  if (!message) return null;
  return <div role="alert" className="error-notice">
    <AlertCircle size={18} className="shrink-0" />
    <span className="flex-1">{message}</span>
    {onRetry && <button className="font-semibold underline" onClick={onRetry}>Retry</button>}
  </div>;
}

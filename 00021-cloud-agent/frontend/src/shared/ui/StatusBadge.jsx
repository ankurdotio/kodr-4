export function StatusBadge({ status, children }) {
  const tone = ['active', 'connected'].includes(status) ? 'green'
    : ['removed', 'error'].includes(status) ? 'red' : 'neutral';
  return <span className={`status-badge status-${tone}`}><span />{children || status}</span>;
}

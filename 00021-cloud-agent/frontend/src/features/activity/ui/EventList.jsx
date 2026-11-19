import { Activity, ArrowUpRight, GitBranch, Radio } from 'lucide-react';
import { Link } from 'react-router';

export function EventList({ events, compact = false }) {
  if (!events.length) return <div className="empty-state">
    <div className="empty-icon"><Radio size={25} strokeWidth={1.4} /></div>
    <h3>Quiet for now. Ready for what’s next.</h3>
    <p>Once your GitHub App is connected, signed webhook<br className="hidden sm:block" /> deliveries will appear here as they arrive.</p>
    <Link className="text-link mt-5" to="/connection">Check your connection<ArrowUpRight size={14} /></Link>
  </div>;
  return <div className="event-list">{events.slice(0, compact ? 4 : 50).map(event => <article className="event-row" key={event.deliveryId}>
    <div className="event-icon"><Activity size={17} /></div>
    <div className="min-w-0 flex-1"><h3>{event.event}{event.action && <span className="text-stone-400">.{event.action}</span>}</h3><p className="flex flex-wrap items-center gap-2">{event.repository && <><GitBranch size={12} />{event.repository}<span className="text-stone-300">·</span></>}{event.actor ? `@${event.actor}` : 'GitHub'}<span className="text-stone-300">·</span><span className="font-mono">{event.deliveryId.slice(0, 8)}</span></p></div>
    <time dateTime={event.receivedAt}>{new Date(event.receivedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
  </article>)}</div>;
}

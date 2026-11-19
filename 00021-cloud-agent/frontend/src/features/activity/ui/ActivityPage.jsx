import { useState } from 'react';
import { RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { useActivity } from '../hooks/useActivity.js';
import { EventList } from './EventList.jsx';
import { ErrorNotice } from '../../../shared/ui/ErrorNotice.jsx';
import { PageHeading } from '../../../shared/ui/PageHeading.jsx';

export function ActivityPage() {
  const { events, status, error, reload } = useActivity();
  const [query, setQuery] = useState('');
  const filtered = events.filter(event => `${event.event} ${event.action} ${event.repository} ${event.actor}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <PageHeading eyebrow="ACTIVITY" title="Every event. In the loop." description="A clear view of the GitHub events reaching your workspace.">
      <button className="button button-secondary" disabled={status === 'loading'} onClick={reload}><RefreshCw size={15} className={status === 'loading' ? 'animate-spin' : ''} />Refresh</button>
    </PageHeading>
    <ErrorNotice message={error} onRetry={reload} />
    <section className="panel">
      <div className="panel-heading flex-wrap gap-4"><div className="flex items-center gap-3"><h2>Webhook deliveries</h2><span className="count-badge">{events.length}</span></div><label className="search-field"><Search size={16} /><input type="search" aria-label="Filter events" placeholder="Filter events..." value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      {status === 'loading' && !events.length ? <p className="loading-message" role="status">Loading deliveries…</p>
        : status === 'error' && !events.length ? <p className="loading-message">Deliveries could not be loaded.</p>
          : query && !filtered.length ? <p className="loading-message">No events match “{query}”.</p> : <EventList events={filtered} />}
      <div className="panel-footnote"><ShieldCheck size={14} /><span>Only signature-verified deliveries. Latest 50 events, retained for 30 days.</span></div>
    </section>
  </>;
}

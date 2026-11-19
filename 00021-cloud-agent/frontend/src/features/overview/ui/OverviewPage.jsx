import { ArrowRight, ArrowUpRight, Check, Github, Radio, ShieldCheck, Webhook } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useConnection } from '../../connection/hooks/useConnection.js';
import { useActivity } from '../../activity/hooks/useActivity.js';
import { EventList } from '../../activity/ui/EventList.jsx';
import { PageHeading } from '../../../shared/ui/PageHeading.jsx';
import { StatusBadge } from '../../../shared/ui/StatusBadge.jsx';
import { ErrorNotice } from '../../../shared/ui/ErrorNotice.jsx';

export function OverviewPage() {
  const { user } = useAuth();
  const connection = useConnection();
  const activity = useActivity();
  const installed = user.installationStatus === 'active';
  return <>
    <PageHeading eyebrow="YOUR WORKSPACE" title="Your workspace, connected." description={`Good to see you, ${user.name.split(' ')[0]}. Let’s keep things moving.`}>
      <span className="workspace-pill"><span />Personal workspace</span>
    </PageHeading>
    <ErrorNotice message={connection.error} />
    <section className="hero-panel">
      <div className="hero-copy"><div className="hero-kicker"><Github size={18} /><span>GITHUB × CLOUD AGENT</span></div><h2>{installed ? 'Your code. A little closer.' : 'Code starts with a connection.'}</h2><p>{installed ? 'Your GitHub App is connected. Repository events have a home, and your workspace is ready for what comes next.' : 'Bring your GitHub repositories into the loop. Connect the app to keep your workspace in sync with your code.'}</p>
        {installed ? <Link to="/connection" className="button button-primary">View connection<ArrowUpRight size={16} /></Link>
          : <button className="button button-primary" disabled={connection.status === 'loading'} onClick={connection.connect}><Github size={16} />{connection.status === 'loading' ? 'Opening GitHub…' : 'Connect GitHub App'}<ArrowUpRight size={16} /></button>}
        <span className="hero-security"><ShieldCheck size={13} />You choose the repositories. Always.</span>
      </div>
      <div className="connection-diagram" aria-hidden="true"><div className="diagram-node"><Github size={33} /></div><div className="diagram-wire"><span /><span /><span /></div><div className="diagram-node diagram-agent"><Radio size={32} /></div><div className="diagram-caption">{installed ? 'CONNECTED & READY' : 'YOUR NEXT CONNECTION'}</div></div>
    </section>
    <div className="stats-grid">
      <section className="stat-card"><div className="stat-label"><span>GitHub account</span><Github size={17} /></div><h3>@{user.username}</h3><StatusBadge status="connected">Connected</StatusBadge></section>
      <section className="stat-card"><div className="stat-label"><span>App installation</span><ShieldCheck size={17} /></div><h3>{installed ? 'Ready to go' : 'One more step'}</h3><StatusBadge status={user.installationStatus} /></section>
      <section className="stat-card"><div className="stat-label"><span>Recent deliveries</span><Webhook size={17} /></div><h3>{activity.status === 'error' ? 'Unavailable' : activity.status === 'loading' ? '…' : String(activity.events.length).padStart(2, '0')}</h3><span className="text-xs text-stone-400">Latest 50 · 30-day retention</span></section>
    </div>
    <section className="panel mt-8">
      <div className="panel-heading"><div className="flex items-center gap-3"><h2>Recent activity</h2><span className="count-badge">{activity.events.length}</span></div><Link className="text-link" to="/activity">View all activity<ArrowRight size={14} /></Link></div>
      <ErrorNotice message={activity.error} onRetry={activity.reload} />
      {activity.status === 'loading' && !activity.events.length ? <p role="status" className="loading-message">Loading activity…</p>
        : activity.status === 'error' && !activity.events.length ? <p className="loading-message">Activity could not be loaded.</p> : <EventList events={activity.events} compact />}
    </section>
    <div className="workspace-note"><Check size={14} /><p>A little less noise. A lot more room to build.</p><span>MADE FOR YOUR FLOW</span></div>
  </>;
}

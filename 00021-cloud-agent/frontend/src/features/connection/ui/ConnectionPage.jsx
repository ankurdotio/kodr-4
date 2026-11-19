import { ArrowUpRight, Check, Github, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useConnection } from '../hooks/useConnection.js';
import { PageHeading } from '../../../shared/ui/PageHeading.jsx';
import { StatusBadge } from '../../../shared/ui/StatusBadge.jsx';
import { ErrorNotice } from '../../../shared/ui/ErrorNotice.jsx';

export function ConnectionPage() {
  const { user, githubAppSlug } = useAuth();
  const { connect, status, error } = useConnection();
  const installed = user.installationStatus === 'active';
  return <>
    <PageHeading eyebrow="INTEGRATIONS" title="One connection. In sync." description="Your GitHub identity and app, right where they belong." />
    <ErrorNotice message={error} />
    <section className="panel connection-panel">
      <div className="connection-title"><div className="icon-tile"><Github size={25} /></div><div className="flex-1"><h2>GitHub account</h2><p>Your identity for this workspace.</p></div><StatusBadge status="connected">Connected</StatusBadge></div>
      <div className="account-details"><img src={user.avatarUrl} alt="" className="h-14 w-14 rounded-full" /><div><h3>{user.name}</h3><p>@{user.username}</p></div><a className="button button-secondary ml-auto" href={`https://github.com/${encodeURIComponent(user.username)}`} target="_blank" rel="noreferrer">View profile<ArrowUpRight size={14} /></a></div>
      <dl className="detail-grid"><div><dt>AUTHENTICATION</dt><dd><ShieldCheck size={15} />GitHub OAuth</dd></div><div><dt>MEMBER SINCE</dt><dd>{new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</dd></div></dl>
    </section>
    <section className="panel connection-panel mt-6">
      <div className="connection-title"><div className="icon-tile"><KeyRound size={23} /></div><div className="flex-1"><h2>{githubAppSlug}</h2><p>GitHub App installation</p></div><StatusBadge status={user.installationStatus} /></div>
      <p className="my-7 max-w-xl text-sm leading-7 text-stone-500">The GitHub App connects repository activity to your workspace. You control which repositories it can access, directly on GitHub.</p>
      <div className="permission-note"><ShieldCheck size={18} /><div><strong>You’re always in control.</strong><p>Installation access is verified with GitHub. Webhook signatures are checked before events are accepted.</p></div></div>
      {user.installationId && <dl className="detail-grid mt-7"><div><dt>INSTALLATION</dt><dd className="font-mono">#{user.installationId}</dd></div><div><dt>ACCOUNT</dt><dd>@{user.installationAccount}</dd></div></dl>}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        {installed ? <a className="button button-primary" href={`https://github.com/settings/installations/${user.installationId}`} target="_blank" rel="noreferrer">Manage on GitHub<ArrowUpRight size={15} /></a>
          : <button className="button button-primary" onClick={connect} disabled={status === 'loading'}><Github size={17} />{status === 'loading' ? 'Opening GitHub…' : 'Connect GitHub App'}<ArrowUpRight size={15} /></button>}
        <span className="flex items-center gap-1.5 text-xs text-stone-400"><Check size={14} />No GitHub tokens stored</span>
      </div>
    </section>
    <p className="mt-6 text-xs leading-6 text-stone-400">Installation status reflects the latest verified login or signed lifecycle webhook. Sign in again to recheck access after making changes on GitHub.</p>
  </>;
}

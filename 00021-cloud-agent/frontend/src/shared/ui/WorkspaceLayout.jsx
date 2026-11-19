import { Activity, ArrowUpRight, Github, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';
import { useState } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { Brand } from './Brand.jsx';
import { ErrorNotice } from './ErrorNotice.jsx';

const navigation = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/connection', label: 'GitHub connection', icon: Github },
];

export function WorkspaceLayout() {
  const { user, logout, logoutState } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="workspace">
    <div className="mobile-header"><Brand /><button aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><Brand /></div>
      <div className="workspace-switch"><span className="workspace-avatar">{user.username.slice(0, 1).toUpperCase()}</span><div><strong>Personal workspace</strong><small>@{user.username}</small></div><span className="workspace-tag">LOCAL</span></div>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
        {navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}><Icon size={18} strokeWidth={1.7} />{label}</NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <a className="sidebar-doc-link" href="https://docs.github.com/en/apps/using-github-apps" target="_blank" rel="noreferrer">GitHub App guide<ArrowUpRight size={14} /></a>
        <div className="environment"><span className="h-1.5 w-1.5 rounded-full bg-stone-400" /><span>LOCAL DEVELOPMENT<small>Docker Desktop cluster</small></span></div>
        <div className="profile-row"><img src={user.avatarUrl} alt="" className="avatar" /><div className="min-w-0 flex-1"><strong className="block truncate">{user.name}</strong><small>@{user.username}</small></div><button title="Sign out" aria-label="Sign out" disabled={logoutState.loading} onClick={logout}><LogOut size={17} /></button></div>
      </div>
    </aside>
    <div className="workspace-main">
      <div className="topbar"><span>Workspace <span className="px-3 text-stone-300">/</span> Personal</span><span className="flex items-center gap-2"><Github size={14} />@{user.username}</span></div>
      <div className="page-content"><ErrorNotice message={logoutState.error} /><Outlet /></div>
      <footer className="workspace-footer"><span>CLOUD AGENT <span className="mx-2 text-stone-300">/</span> YOUR CODE, CONNECTED.</span><span>LOCAL ENVIRONMENT</span></footer>
    </div>
  </div>;
}

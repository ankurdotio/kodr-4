import { Navigate, Route, Routes, Link } from 'react-router';
import { useSelector } from 'react-redux';
import { useBootstrapSession } from '../features/auth/hooks/useAuth.js';
import { LoginPage } from '../features/auth/ui/LoginPage.jsx';
import { OverviewPage } from '../features/overview/ui/OverviewPage.jsx';
import { ActivityPage } from '../features/activity/ui/ActivityPage.jsx';
import { ConnectionPage } from '../features/connection/ui/ConnectionPage.jsx';
import { WorkspaceLayout } from '../shared/ui/WorkspaceLayout.jsx';
import { Brand } from '../shared/ui/Brand.jsx';
import { ErrorNotice } from '../shared/ui/ErrorNotice.jsx';

export function App() {
  const restore = useBootstrapSession();
  const { status, error } = useSelector(state => state.auth);
  if (status === 'initializing') return <main className="session-screen"><Brand /><p role="status">Opening your workspace…</p></main>;
  if (status === 'error') return <main className="session-screen"><Brand /><ErrorNotice message={error} onRetry={restore} /><a className="text-link" href="/api/v1/auth/github">Sign in with GitHub instead</a></main>;
  const authenticated = status === 'authenticated';
  return <Routes>
    <Route path="/login" element={authenticated ? <Navigate to="/" replace /> : <LoginPage />} />
    <Route path="/auth/callback" element={<Navigate to={authenticated ? '/' : '/login'} replace />} />
    {authenticated ? <Route element={<WorkspaceLayout />}>
      <Route index element={<OverviewPage />} />
      <Route path="activity" element={<ActivityPage />} />
      <Route path="connection" element={<ConnectionPage />} />
      <Route path="*" element={<div className="empty-state"><h1 className="text-3xl font-semibold">This page took a detour.</h1><Link className="text-link mt-5" to="/">Back to overview</Link></div>} />
    </Route> : <Route path="*" element={<Navigate to="/login" replace />} />}
  </Routes>;
}

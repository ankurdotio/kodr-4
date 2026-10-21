import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { restoreSession } from '../state/authSlice.js'
import { useAuth } from '../hooks/useAuth.js'
import AuthPage from './pages/AuthPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function HomeRedirect() {
  const { isAuthenticated, status } = useAuth()
  if (status === 'initializing') return <PageLoading />
  return <Navigate to={isAuthenticated ? '/app' : '/login'} replace />
}
    
function PageLoading() {
  return <main className="grid min-h-screen place-items-center text-sm text-[var(--muted)]" aria-live="polite">Restoring your session...</main>
}

function AppRoutes() {
  const dispatch = useDispatch()
  const started = useRef(false)

  useEffect(() => {
    if (!started.current) {
      started.current = true
      dispatch(restoreSession())
    }
  }, [dispatch])

  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>
}
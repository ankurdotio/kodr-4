import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { closeAuthModal, setAuthModalView } from '../../../app/uiSlice'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { X } from 'lucide-react'

export const AuthModal = () => {
  const dispatch = useDispatch()
  const { isAuthModalOpen, authModalView } = useSelector((state) => state.ui)

  if (!isAuthModalOpen) return null

  const handleClose = () => {
    dispatch(closeAuthModal())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-canvas border border-hairline p-8 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {authModalView === 'login' ? (
          <LoginForm
            onSuccess={handleClose}
            onSwitchToRegister={() => dispatch(setAuthModalView('register'))}
          />
        ) : (
          <RegisterForm
            onSuccess={handleClose}
            onSwitchToLogin={() => dispatch(setAuthModalView('login'))}
          />
        )}
      </div>
    </div>
  )
}

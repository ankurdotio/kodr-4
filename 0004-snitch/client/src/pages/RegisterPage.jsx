import React from 'react'
import { useNavigate } from 'react-router-dom'
import { RegisterForm } from '../features/auth/ui/RegisterForm'

export const RegisterPage = () => {
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="bg-surface border border-hairline p-8 sm:p-12 max-w-md mx-auto shadow-sm">
        <RegisterForm
          onSuccess={() => navigate('/')}
          onSwitchToLogin={() => navigate('/auth/login')}
        />
      </div>
    </div>
  )
}

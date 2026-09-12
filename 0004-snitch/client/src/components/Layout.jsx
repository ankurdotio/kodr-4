import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { CartDrawer } from '../features/cart/ui/CartDrawer'
import { AuthModal } from '../features/auth/ui/AuthModal'
import { Toast } from './Toast'

export const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />

      {/* Global Overlays */}
      <CartDrawer />
      <AuthModal />
      <Toast />
    </div>
  )
}

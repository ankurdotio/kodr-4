import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  toggleCartDrawer,
  openAuthModal,
  toggleMobileMenu,
  closeMobileMenu,
} from '../app/uiSlice'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useCart } from '../features/cart/hooks/useCart'
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  Shield,
  LogOut,
} from 'lucide-react'

export const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, isSeller, signOut } = useAuth()
  const { itemCount } = useCart()
  const { mobileMenuOpen } = useSelector((state) => state.ui)

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
      setSearchOpen(false)
    }
  }

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate('/account')
    } else {
      dispatch(openAuthModal('login'))
    }
  }

  const navCategories = [
    { label: 'All Products', path: '/products' },
    { label: 'T-Shirts', path: '/products?category=T-Shirts' },
    { label: 'Shirts', path: '/products?category=Shirts' },
    { label: 'Jeans', path: '/products?category=Jeans' },
    { label: 'Jackets', path: '/products?category=Jackets' },
    { label: 'Hoodies', path: '/products?category=Hoodies' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-hairline transition-all">
      {/* Top Banner */}
      <div className="bg-ink text-canvas py-1.5 px-4 text-center text-[10px] uppercase tracking-eyebrow font-medium">
        Complimentary Shipping & 7-Day Boutique Exchanges Across India
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="p-2 text-ink hover:text-accent transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Left Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navCategories.slice(0, 4).map((cat) => (
              <Link
                key={cat.label}
                to={cat.path}
                className={`text-xs uppercase tracking-eyebrow text-ink-muted hover:text-ink transition-colors ${
                  location.pathname + location.search === cat.path
                    ? 'text-ink font-medium underline underline-offset-4'
                    : ''
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          {/* Wordmark Logo */}
          <div className="flex-1 lg:flex-none text-center">
            <Link to="/" className="inline-block group">
              <span className="font-serif text-3xl md:text-4xl tracking-tight text-ink uppercase">
                Snitch
              </span>
            </Link>
          </div>

          {/* Right Navigation & Utility Actions */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-ink hover:text-accent transition-colors"
              aria-label="Search Catalog"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
            </button>

            {/* Seller Portal Link */}
            {isSeller && (
              <Link
                to="/seller"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-hairline text-ink hover:border-ink text-[11px] uppercase tracking-eyebrow font-medium transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Seller
              </Link>
            )}

            {/* Account Link / Login */}
            <button
              onClick={handleAccountClick}
              className="p-2 text-ink hover:text-accent transition-colors flex items-center gap-1"
              aria-label="My Account"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
              {isAuthenticated && (
                <span className="hidden md:inline text-xs uppercase tracking-eyebrow text-ink font-medium max-w-[80px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
              )}
            </button>

            {/* Bag Drawer Trigger */}
            <button
              onClick={() => dispatch(toggleCartDrawer())}
              className="relative p-2 text-ink hover:text-accent transition-colors"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-ink text-canvas text-[9px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="py-4 border-t border-hairline animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-xl mx-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search shirts, trousers, jackets, linen..."
                autoFocus
                className="flex-1 bg-surface border border-hairline px-4 py-2.5 text-xs uppercase tracking-eyebrow text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-ink"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium hover:bg-ink/90 transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-hairline bg-surface p-6 space-y-4 animate-fadeIn">
          <nav className="space-y-3">
            {navCategories.map((cat) => (
              <Link
                key={cat.label}
                to={cat.path}
                onClick={() => dispatch(closeMobileMenu())}
                className="block text-xs uppercase tracking-eyebrow text-ink hover:text-accent font-medium py-1"
              >
                {cat.label}
              </Link>
            ))}

            {isSeller && (
              <Link
                to="/seller"
                onClick={() => dispatch(closeMobileMenu())}
                className="block text-xs uppercase tracking-eyebrow text-accent font-medium py-1"
              >
                Seller Dashboard
              </Link>
            )}

            {isAuthenticated ? (
              <div className="pt-4 border-t border-hairline flex items-center justify-between">
                <Link
                  to="/account"
                  onClick={() => dispatch(closeMobileMenu())}
                  className="text-xs uppercase tracking-eyebrow text-ink font-medium"
                >
                  My Profile ({user?.name})
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    dispatch(closeMobileMenu())
                  }}
                  className="text-xs uppercase tracking-eyebrow text-critical"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-hairline">
                <button
                  onClick={() => {
                    dispatch(closeMobileMenu())
                    dispatch(openAuthModal('login'))
                  }}
                  className="w-full py-2.5 bg-ink text-canvas text-xs uppercase tracking-eyebrow text-center font-medium"
                >
                  Sign In / Create Account
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

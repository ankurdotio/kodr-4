import React from 'react'
import { Link } from 'react-router-dom'

export const Footer = () => {
  return (
    <footer className="bg-ink text-canvas mt-20 border-t border-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <span className="font-serif text-3xl uppercase tracking-wider text-canvas block">
              Snitch
            </span>
            <p className="text-xs uppercase tracking-eyebrow text-sand font-light max-w-sm leading-relaxed">
              Quiet luxury menswear designed for modern distinction. Tailored silhouettes, premium textiles, and effortless elegance.
            </p>
          </div>

          {/* Catalog Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-eyebrow text-canvas font-medium">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-sand">
              <li>
                <Link to="/products?category=T-Shirts" className="hover:text-canvas transition-colors">
                  T-Shirts & Polos
                </Link>
              </li>
              <li>
                <Link to="/products?category=Shirts" className="hover:text-canvas transition-colors">
                  Tailored Shirts
                </Link>
              </li>
              <li>
                <Link to="/products?category=Jeans" className="hover:text-canvas transition-colors">
                  Denim & Jeans
                </Link>
              </li>
              <li>
                <Link to="/products?category=Jackets" className="hover:text-canvas transition-colors">
                  Outerwear & Jackets
                </Link>
              </li>
              <li>
                <Link to="/products?category=Hoodies" className="hover:text-canvas transition-colors">
                  Knitwear & Hoodies
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-eyebrow text-canvas font-medium">
              Client Services
            </h4>
            <ul className="space-y-2 text-xs text-sand">
              <li>
                <span className="block text-sand">Mon – Sat: 10:00 AM – 7:00 PM IST</span>
              </li>
              <li>
                <span className="block text-sand">care@snitch.co.in · +91 (80) 4567 8900</span>
              </li>
              <li>
                <span className="block text-sand">Express Doorstep Delivery Across India</span>
              </li>
              <li>
                <span className="block text-sand">Hassle-Free 7-Day Exchange Guarantee</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-hairline/20 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-sand/60">
          <p>© {new Date().getFullYear()} Snitch Menswear Studio. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0 uppercase tracking-eyebrow text-[10px]">
            <span>Privacy</span>
            <span>Terms of Sale</span>
            <span>Boutiques</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

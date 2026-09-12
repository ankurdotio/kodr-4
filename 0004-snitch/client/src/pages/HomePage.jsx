import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../features/products/hooks/useProducts'
import { ProductGrid } from '../features/products/ui/ProductGrid'
import { ArrowRight, Sparkles, Shield, Truck } from 'lucide-react'

export const HomePage = () => {
  const { products, isLoading, error, loadProducts } = useProducts(true)

  useEffect(() => {
    loadProducts(1)
  }, [loadProducts])

  const featuredList = products.slice(0, 8)

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Editorial Hero Section */}
      <section className="relative bg-surface border-b border-hairline overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-eyebrow text-accent font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Collection 2026 · Atelier Series
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-ink font-normal leading-[1.08] tracking-tight">
                Quiet luxury for the discerning man.
              </h1>
              <p className="text-sm md:text-base text-ink-muted max-w-lg leading-relaxed">
                Elevating everyday garments through bespoke tailoring, architectural drape, and tactile natural fibers. Crafted without compromise.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium hover:bg-ink/90 transition-colors"
                >
                  Explore Collection
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/products?category=Shirts"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-hairline bg-surface text-ink text-xs uppercase tracking-eyebrow font-medium hover:border-ink transition-colors"
                >
                  Tailored Shirts
                </Link>
              </div>
            </div>

            {/* Hero Editorial Imagery */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[3/4] overflow-hidden border border-hairline bg-canvas">
                <img
                  src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1200&auto=format&fit=crop&q=85"
                  alt="Snitch Menswear Hero"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-canvas/90 backdrop-blur-xs border border-hairline text-xs">
                  <span className="uppercase tracking-eyebrow text-[10px] text-ink-muted block">
                    Look 04 / Autumn Capsule
                  </span>
                  <span className="font-serif text-sm text-ink">
                    Relaxed Linen Trouser & Structured Overshirt
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-hairline">
          <div>
            <span className="text-xs uppercase tracking-eyebrow text-ink-muted">Curation</span>
            <h2 className="font-serif text-3xl md:text-4xl text-ink font-normal mt-1">
              Shop by Wardrobe Essential
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs uppercase tracking-eyebrow text-ink underline hover:text-accent transition-colors mt-2 sm:mt-0"
          >
            View All Categories
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              name: 'Tailored Shirts',
              cat: 'Shirts',
              img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
            },
            {
              name: 'Heavyweight Tees',
              cat: 'T-Shirts',
              img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
            },
            {
              name: 'Outerwear & Jackets',
              cat: 'Jackets',
              img: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
            },
            {
              name: 'Denim & Trousers',
              cat: 'Jeans',
              img: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80',
            },
          ].map((item) => (
            <Link
              key={item.name}
              to={`/products?category=${item.cat}`}
              className="group block relative aspect-[3/4] overflow-hidden bg-surface border border-hairline"
            >
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent flex flex-col justify-end p-4 sm:p-6 text-canvas">
                <span className="text-xs uppercase tracking-eyebrow font-medium">
                  {item.name}
                </span>
                <span className="text-[11px] text-sand/80 flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse Series <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-hairline">
          <div>
            <span className="text-xs uppercase tracking-eyebrow text-ink-muted">New Arrivals</span>
            <h2 className="font-serif text-3xl md:text-4xl text-ink font-normal mt-1">
              Featured Garments
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs uppercase tracking-eyebrow text-ink underline hover:text-accent transition-colors mt-2 sm:mt-0"
          >
            Explore Complete Catalog
          </Link>
        </div>

        <ProductGrid products={featuredList} isLoading={isLoading} error={error} />
      </section>

      {/* Brand Pillars */}
      <section className="border-y border-hairline bg-surface py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="space-y-3 p-6 border-b md:border-b-0 md:border-r border-hairline">
              <Truck className="w-6 h-6 text-ink stroke-[1.5]" />
              <h3 className="font-serif text-xl text-ink">Complimentary Delivery</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Seamless doorstep courier service on all orders across India with real-time tracking.
              </p>
            </div>
            <div className="space-y-3 p-6 border-b md:border-b-0 md:border-r border-hairline">
              <Shield className="w-6 h-6 text-ink stroke-[1.5]" />
              <h3 className="font-serif text-xl text-ink">Boutique Quality</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Precision stitch counts, reinforced French seams, and enduring organic yarns.
              </p>
            </div>
            <div className="space-y-3 p-6">
              <Sparkles className="w-6 h-6 text-ink stroke-[1.5]" />
              <h3 className="font-serif text-xl text-ink">7-Day Exchanges</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Effortless size swaps and doorstep reverse pickups for total peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

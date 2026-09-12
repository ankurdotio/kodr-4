import React, { useEffect, useState } from 'react'
import { useSellerProducts } from '../features/products/hooks/useSellerProducts'
import { useOrders } from '../features/orders/hooks/useOrders'
import { SellerProductList } from '../features/products/ui/SellerProductList'
import { SellerOrdersList } from '../features/orders/ui/SellerOrdersList'
import { Package, ShoppingBag, Plus } from 'lucide-react'

export const SellerDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('products') // 'products' | 'orders'
  const {
    sellerProducts,
    isLoading: isProductsLoading,
    error: productsError,
    totalPages,
    currentPage,
    loadSellerProducts,
    togglePublish,
  } = useSellerProducts()

  const {
    orders,
    isLoading: isOrdersLoading,
    error: ordersError,
    loadOrders,
    updateStatus,
  } = useOrders()

  useEffect(() => {
    loadSellerProducts(1)
    loadOrders()
  }, [loadSellerProducts, loadOrders])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Top Banner */}
      <div className="border-b border-hairline pb-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-eyebrow text-accent font-medium">
            Atelier Portal
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-ink font-normal mt-1">
            Seller Dashboard
          </h1>
          <p className="text-xs text-ink-muted mt-2">
            Oversee bespoke catalog listings, inventory stocks, and customer orders.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-eyebrow transition-all ${
              activeTab === 'products'
                ? 'bg-ink text-canvas font-medium'
                : 'bg-surface border border-hairline text-ink hover:border-ink'
            }`}
          >
            <Package className="w-4 h-4" />
            Products ({sellerProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-eyebrow transition-all ${
              activeTab === 'orders'
                ? 'bg-ink text-canvas font-medium'
                : 'bg-surface border border-hairline text-ink hover:border-ink'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Store Orders ({orders.length})
          </button>
        </div>
      </div>

      {activeTab === 'products' ? (
        <SellerProductList
          products={sellerProducts}
          isLoading={isProductsLoading}
          error={productsError}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={loadSellerProducts}
          onTogglePublish={togglePublish}
        />
      ) : (
        <SellerOrdersList
          orders={orders}
          isLoading={isOrdersLoading}
          error={ordersError}
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  )
}

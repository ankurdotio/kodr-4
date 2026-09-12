import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { ProductsPage } from '../pages/ProductsPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { BagPage } from '../pages/BagPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage'
import { OrdersPage } from '../pages/OrdersPage'
import { AccountPage } from '../pages/AccountPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { SellerDashboardPage } from '../pages/SellerDashboardPage'
import { SellerNewProductPage } from '../pages/SellerNewProductPage'
import { SellerEditProductPage } from '../pages/SellerEditProductPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProtectedRoute } from './ProtectedRoute'
import { SellerRoute } from './SellerRoute'

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Storefront */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/bag" element={<BagPage />} />

      {/* Auth */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Buyer Protected */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id/confirmation"
        element={
          <ProtectedRoute>
            <OrderConfirmationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        }
      />

      {/* Seller Portal */}
      <Route
        path="/seller"
        element={
          <SellerRoute>
            <SellerDashboardPage />
          </SellerRoute>
        }
      />
      <Route
        path="/seller/products/new"
        element={
          <SellerRoute>
            <SellerNewProductPage />
          </SellerRoute>
        }
      />
      <Route
        path="/seller/products/edit/:id"
        element={
          <SellerRoute>
            <SellerEditProductPage />
          </SellerRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

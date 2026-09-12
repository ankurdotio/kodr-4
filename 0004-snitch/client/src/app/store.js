import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/state/authSlice'
import productReducer from '../features/products/state/productSlice'
import cartReducer from '../features/cart/state/cartSlice'
import orderReducer from '../features/orders/state/orderSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
})

export default store

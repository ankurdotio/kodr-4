import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isCartDrawerOpen: false,
  isAuthModalOpen: false,
  authModalView: 'login', // 'login' | 'register'
  mobileMenuOpen: false,
  toast: null, // { type: 'success' | 'error' | 'info', message: string }
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCartDrawer: (state) => {
      state.isCartDrawerOpen = true
    },
    closeCartDrawer: (state) => {
      state.isCartDrawerOpen = false
    },
    toggleCartDrawer: (state) => {
      state.isCartDrawerOpen = !state.isCartDrawerOpen
    },
    openAuthModal: (state, action) => {
      state.isAuthModalOpen = true
      state.authModalView = action.payload || 'login'
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false
    },
    setAuthModalView: (state, action) => {
      state.authModalView = action.payload
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false
    },
    showToast: (state, action) => {
      state.toast = action.payload
    },
    clearToast: (state) => {
      state.toast = null
    },
  },
})

export const {
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
  openAuthModal,
  closeAuthModal,
  setAuthModalView,
  toggleMobileMenu,
  closeMobileMenu,
  showToast,
  clearToast,
} = uiSlice.actions

export default uiSlice.reducer

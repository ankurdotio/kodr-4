import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartApi } from '../api/cartApi'

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.getCart()
      return response.data
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch cart')
    }
  }
)

export const addToCartAction = createAsyncThunk(
  'cart/addToCartAction',
  async ({ productId, size, quantity }, { dispatch, rejectWithValue }) => {
    try {
      const response = await cartApi.addToCart(productId, { size, quantity })
      // Refetch latest populated cart
      await dispatch(fetchCart())
      return response
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add item to bag')
    }
  }
)

export const removeFromCartAction = createAsyncThunk(
  'cart/removeFromCartAction',
  async ({ productId, size, quantity }, { dispatch, rejectWithValue }) => {
    try {
      const response = await cartApi.removeFromCart(productId, { size, quantity })
      // Refetch latest populated cart
      await dispatch(fetchCart())
      return response
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to remove item from bag')
    }
  }
)

const initialState = {
  cart: null,
  items: [],
  totalPrice: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = null
      state.items = []
      state.totalPrice = 0
      state.itemCount = 0
      state.error = null
    },
    clearCartError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false
        const cartData = action.payload?.cart
        state.cart = cartData
        state.items = cartData?.products || []
        state.totalPrice = action.payload?.totalPrice || 0
        state.itemCount = state.items.reduce((acc, item) => acc + (item.quantity || 0), 0)
        state.error = null
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(addToCartAction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addToCartAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(removeFromCartAction.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeFromCartAction.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearCart, clearCartError } = cartSlice.actions
export default cartSlice.reducer

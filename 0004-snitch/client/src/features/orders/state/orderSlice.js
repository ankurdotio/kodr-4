import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { orderApi } from '../api/orderApi'
import { clearCart } from '../../cart/state/cartSlice'

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderApi.getOrders()
      return response.data.orders
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch orders')
    }
  }
)

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (address, { dispatch, rejectWithValue }) => {
    try {
      const response = await orderApi.createOrder(address)
      dispatch(clearCart())
      return response.data.order
    } catch (err) {
      const msg = err.errors?.length
        ? err.errors.map((e) => e.message).join(', ')
        : err.message || 'Failed to place order'
      return rejectWithValue(msg)
    }
  }
)

export const cancelOrderAction = createAsyncThunk(
  'orders/cancelOrderAction',
  async (orderId, { rejectWithValue }) => {
    try {
      await orderApi.cancelOrder(orderId)
      return orderId
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to cancel order')
    }
  }
)

export const updateOrderStatusAction = createAsyncThunk(
  'orders/updateOrderStatusAction',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      await orderApi.updateOrderStatus(orderId, status)
      return { orderId, status }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update order status')
    }
  }
)

const initialState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
    clearOrderError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload || []
        state.error = null
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Place order
    builder
      .addCase(placeOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentOrder = action.payload
        state.orders.unshift(action.payload)
        state.error = null
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Cancel order
    builder.addCase(cancelOrderAction.fulfilled, (state, action) => {
      const order = state.orders.find((o) => o._id === action.payload)
      if (order) {
        order.status = 'CANCELLED'
      }
      if (state.currentOrder && state.currentOrder._id === action.payload) {
        state.currentOrder.status = 'CANCELLED'
      }
    })

    // Update status (seller)
    builder.addCase(updateOrderStatusAction.fulfilled, (state, action) => {
      const order = state.orders.find((o) => o._id === action.payload.orderId)
      if (order) {
        order.status = action.payload.status
      }
    })
  },
})

export const { setCurrentOrder, clearCurrentOrder, clearOrderError } = orderSlice.actions
export default orderSlice.reducer

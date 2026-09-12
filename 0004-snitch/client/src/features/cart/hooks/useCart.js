import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useEffect } from 'react'
import {
  fetchCart,
  addToCartAction,
  removeFromCartAction,
  clearCartError,
} from '../state/cartSlice'
import { openAuthModal } from '../../../app/uiSlice'

export const useCart = () => {
  const dispatch = useDispatch()
  const { cart, items, totalPrice, itemCount, isLoading, error } = useSelector(
    (state) => state.cart
  )
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated && !cart && !isLoading) {
      dispatch(fetchCart())
    }
  }, [dispatch, isAuthenticated, cart, isLoading])

  const loadCart = useCallback(() => {
    if (isAuthenticated) {
      return dispatch(fetchCart())
    }
  }, [dispatch, isAuthenticated])

  const addToCart = useCallback(
    async ({ productId, size, quantity = 1 }) => {
      if (!isAuthenticated) {
        dispatch(openAuthModal('login'))
        return false
      }
      const resultAction = await dispatch(
        addToCartAction({ productId, size, quantity })
      )
      return addToCartAction.fulfilled.match(resultAction)
    },
    [dispatch, isAuthenticated]
  )

  const removeFromCart = useCallback(
    async ({ productId, size, quantity = 1 }) => {
      if (!isAuthenticated) return false
      const resultAction = await dispatch(
        removeFromCartAction({ productId, size, quantity })
      )
      return removeFromCartAction.fulfilled.match(resultAction)
    },
    [dispatch, isAuthenticated]
  )

  const incrementItem = useCallback(
    async (item) => {
      const productId = item.product?._id || item.product?.id || item.product
      return addToCart({ productId, size: item.size, quantity: 1 })
    },
    [addToCart]
  )

  const decrementItem = useCallback(
    async (item) => {
      const productId = item.product?._id || item.product?.id || item.product
      return removeFromCart({ productId, size: item.size, quantity: 1 })
    },
    [removeFromCart]
  )

  const removeItemCompletely = useCallback(
    async (item) => {
      const productId = item.product?._id || item.product?.id || item.product
      return removeFromCart({ productId, size: item.size, quantity: item.quantity })
    },
    [removeFromCart]
  )

  const clearError = useCallback(() => {
    dispatch(clearCartError())
  }, [dispatch])

  return {
    cart,
    items,
    totalPrice,
    itemCount,
    isLoading,
    error,
    loadCart,
    addToCart,
    removeFromCart,
    incrementItem,
    decrementItem,
    removeItemCompletely,
    clearError,
  }
}

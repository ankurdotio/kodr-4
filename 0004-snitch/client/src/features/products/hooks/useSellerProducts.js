import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import {
  fetchSellerProducts,
  createProductAction,
  updateProductAction,
  togglePublishAction,
  deleteImageAction,
} from '../state/productSlice'

export const useSellerProducts = () => {
  const dispatch = useDispatch()
  const {
    sellerItems,
    sellerTotalPages,
    sellerCurrentPage,
    isSellerLoading,
    sellerError,
  } = useSelector((state) => state.products)

  const loadSellerProducts = useCallback(
    (page = 1) => {
      return dispatch(fetchSellerProducts(page))
    },
    [dispatch]
  )

  const createProduct = useCallback(
    async (formData) => {
      const resultAction = await dispatch(createProductAction(formData))
      return createProductAction.fulfilled.match(resultAction) ? resultAction.payload : false
    },
    [dispatch]
  )

  const updateProduct = useCallback(
    async (id, formData) => {
      const resultAction = await dispatch(updateProductAction({ id, formData }))
      return updateProductAction.fulfilled.match(resultAction) ? resultAction.payload : false
    },
    [dispatch]
  )

  const togglePublish = useCallback(
    async (productId) => {
      const resultAction = await dispatch(togglePublishAction(productId))
      return togglePublishAction.fulfilled.match(resultAction)
    },
    [dispatch]
  )

  const deleteImage = useCallback(
    async (productId, imageId) => {
      const resultAction = await dispatch(deleteImageAction({ productId, imageId }))
      return deleteImageAction.fulfilled.match(resultAction)
    },
    [dispatch]
  )

  return {
    sellerProducts: sellerItems,
    totalPages: sellerTotalPages,
    currentPage: sellerCurrentPage,
    isLoading: isSellerLoading,
    error: sellerError,
    loadSellerProducts,
    createProduct,
    updateProduct,
    togglePublish,
    deleteImage,
  }
}

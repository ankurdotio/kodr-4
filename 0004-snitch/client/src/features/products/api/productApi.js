import axiosClient from '../../../api/axiosClient'

export const productApi = {
  getProducts: async (page = 1) => {
    return await axiosClient.get(`/products?page=${page}`)
  },

  getSellerProducts: async (page = 1) => {
    return await axiosClient.get(`/products/seller?page=${page}`)
  },

  createProduct: async (formData) => {
    return await axiosClient.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  updateProduct: async (id, formData) => {
    return await axiosClient.patch(`/products/update/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteProductImage: async (productId, imageId) => {
    return await axiosClient.delete(`/products/image/${productId}/${imageId}`)
  },

  togglePublishProduct: async (productId) => {
    return await axiosClient.patch(`/products/publish/${productId}`)
  },
}

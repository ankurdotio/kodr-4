import axiosClient from '../../../api/axiosClient'

export const cartApi = {
  getCart: async () => {
    return await axiosClient.get('/cart')
  },

  addToCart: async (productId, { size, quantity = 1 }) => {
    return await axiosClient.post(`/cart/add/product/${productId}`, {
      size,
      quantity,
    })
  },

  removeFromCart: async (productId, { size, quantity = 1 }) => {
    return await axiosClient.delete(`/cart/remove/product/${productId}`, {
      data: {
        size,
        quantity,
      },
    })
  },
}

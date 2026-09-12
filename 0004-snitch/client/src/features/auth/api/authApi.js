import axiosClient from '../../../api/axiosClient'

export const authApi = {
  login: async (credentials) => {
    return await axiosClient.post('/auth/login', credentials)
  },

  register: async (userData) => {
    return await axiosClient.post('/auth/register', userData)
  },

  getMe: async () => {
    return await axiosClient.get('/auth/me')
  },
}

import axios from 'axios'

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach Bearer Token from localStorage
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Handle errors uniformly
axiosClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred'
    
    // If unauthorized and token exists, clear invalid token
    if (status === 401) {
      localStorage.removeItem('token')
    }

    return Promise.reject({
      status,
      message,
      errors: error.response?.data?.errors,
      originalError: error,
    })
  }
)

export default axiosClient

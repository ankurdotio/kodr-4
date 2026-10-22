import axios from 'axios'

let accessToken = null
let refreshRequest = null
let sessionExpiredHandler = () => { }
let tokenUpdatedHandler = () => { }

export const apiClient = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
})

export function setAccessToken(token) {
    accessToken = token
}

export function setSessionExpiredHandler(handler) {
    sessionExpiredHandler = handler
}

export function setTokenUpdatedHandler(handler) {
    tokenUpdatedHandler = handler
}

apiClient.interceptors.request.use((config) => {
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
    return config
})

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const url = originalRequest?.url ?? ''
        const isAuthAction = [ '/auth/login', '/auth/register', '/auth/refresh', '/auth/logout' ]
            .some((path) => url.includes(path))

        if (error.response?.status !== 401 || !accessToken || isAuthAction || originalRequest?._retried) {
            return Promise.reject(error)
        }

        originalRequest._retried = true
        try {
            if (!refreshRequest) {
                refreshRequest = axios
                    .post('/api/auth/refresh', {}, { withCredentials: true })
                    .then((response) => {
                        accessToken = response.data.data.accessToken
                        tokenUpdatedHandler(accessToken)
                        return accessToken
                    })
                    .finally(() => {
                        refreshRequest = null
                    })
            }

            const refreshedToken = await refreshRequest
            originalRequest.headers.Authorization = `Bearer ${refreshedToken}`
            return apiClient(originalRequest)
        } catch (refreshError) {
            accessToken = null
            sessionExpiredHandler()
            return Promise.reject(refreshError)
        }
    },
)
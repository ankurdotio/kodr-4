import { apiClient } from './client.js'

function unwrap(response) {
    return response.data.data
}

export async function registerAccount(credentials) {
    return unwrap(await apiClient.post('/auth/register', credentials))
}

export async function loginAccount(credentials) {
    return unwrap(await apiClient.post('/auth/login', credentials))
}

export async function refreshSession() {
    return unwrap(await apiClient.post('/auth/refresh'))
}

export async function logoutAccount() {
    return unwrap(await apiClient.post('/auth/logout'))
}
import axios from 'axios';

export const http = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

export const bearer = token => ({ headers: { Authorization: `Bearer ${token}` } });

export function errorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (!error.response) return 'Cannot reach the backend. Check your local ingress and try again.';
  return 'The request failed. Please try again.';
}

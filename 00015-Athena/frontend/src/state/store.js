import { configureStore } from '@reduxjs/toolkit'
import { setSessionExpiredHandler, setTokenUpdatedHandler } from '../api/client.js'
import authReducer, { clearSession, updateAccessToken } from './authSlice.js'

export const store = configureStore({ reducer: { auth: authReducer } })

setSessionExpiredHandler(() => store.dispatch(clearSession()))
setTokenUpdatedHandler((token) => store.dispatch(updateAccessToken(token)))
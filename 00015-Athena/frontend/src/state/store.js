import { configureStore } from '@reduxjs/toolkit'
import { setSessionExpiredHandler, setTokenUpdatedHandler } from '../api/client.js'
import authReducer, { clearSession, updateAccessToken } from './authSlice.js'
import conversationReducer from './conversationSlice.js'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        conversation: conversationReducer,
    },
})

setSessionExpiredHandler(() => store.dispatch(clearSession()))
setTokenUpdatedHandler((token) => store.dispatch(updateAccessToken(token)))
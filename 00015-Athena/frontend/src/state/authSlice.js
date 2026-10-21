import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { loginAccount, logoutAccount, refreshSession, registerAccount } from '../api/authApi.js'
import { setAccessToken } from '../api/client.js'

function getRequestError(error) {
    return {
        message: error.response?.data?.message ?? 'Something went wrong. Please try again.',
        fieldErrors: error.response?.data?.errors ?? [],
    }
}

export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { rejectWithValue }) => {
    try {
        return await refreshSession()
    } catch (error) {
        return rejectWithValue(getRequestError(error))
    }
})

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        return await loginAccount(credentials)
    } catch (error) {
        return rejectWithValue(getRequestError(error))
    }
})

export const registerUser = createAsyncThunk('auth/register', async (credentials, { rejectWithValue }) => {
    try {
        return await registerAccount(credentials)
    } catch (error) {
        return rejectWithValue(getRequestError(error))
    }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
    try {
        await logoutAccount()
    } finally {
        setAccessToken(null)
    }
})

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: null, accessToken: null, status: 'initializing', error: null },
    reducers: {
        clearSession(state) {
            state.user = null
            state.accessToken = null
            state.status = 'idle'
            state.error = null
            setAccessToken(null)
        },
        clearAuthError(state) {
            state.error = null
        },
        updateAccessToken(state, action) {
            state.accessToken = action.payload
        },
    },
    extraReducers(builder) {
        builder
            .addCase(restoreSession.fulfilled, (state, action) => {
                state.user = action.payload.user
                state.accessToken = action.payload.accessToken
                state.status = 'ready'
                setAccessToken(action.payload.accessToken)
            })
            .addCase(restoreSession.rejected, (state) => {
                state.user = null
                state.accessToken = null
                state.status = 'ready'
                setAccessToken(null)
            })
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload.user
                state.accessToken = action.payload.accessToken
                state.status = 'ready'
                state.error = null
                setAccessToken(action.payload.accessToken)
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'ready'
                state.error = action.payload ?? { message: 'Unable to sign in.', fieldErrors: [] }
            })
            .addCase(registerUser.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.user = action.payload.user
                state.accessToken = action.payload.accessToken
                state.status = 'ready'
                state.error = null
                setAccessToken(action.payload.accessToken)
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'ready'
                state.error = action.payload ?? { message: 'Unable to create your account.', fieldErrors: [] }
            })
            .addCase(logoutUser.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null
                state.accessToken = null
                state.status = 'ready'
                state.error = null
            })
            .addCase(logoutUser.rejected, (state) => {
                state.user = null
                state.accessToken = null
                state.status = 'ready'
            })
    },
})

export const { clearAuthError, clearSession, updateAccessToken } = authSlice.actions
export const selectAuth = (state) => state.auth
export default authSlice.reducer
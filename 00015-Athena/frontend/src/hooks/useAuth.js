import { useDispatch, useSelector } from 'react-redux'
import { clearAuthError, loginUser, logoutUser, registerUser, selectAuth } from '../state/authSlice.js'

export function useAuth() {
    const dispatch = useDispatch()
    const auth = useSelector(selectAuth)

    return {
        ...auth,
        isAuthenticated: Boolean(auth.user),
        isSubmitting: auth.status === 'loading',
        login: (credentials) => dispatch(loginUser(credentials)),
        register: (credentials) => dispatch(registerUser(credentials)),
        logout: () => dispatch(logoutUser()),
        clearError: () => dispatch(clearAuthError()),
    }
}
import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useEffect } from 'react'
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
  logout,
  clearAuthError,
} from '../state/authSlice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    if (token && !user && !isLoading) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, token, user, isLoading])

  const login = useCallback(
    async (credentials) => {
      const resultAction = await dispatch(loginUser(credentials))
      return loginUser.fulfilled.match(resultAction)
    },
    [dispatch]
  )

  const register = useCallback(
    async (userData) => {
      const resultAction = await dispatch(registerUser(userData))
      return registerUser.fulfilled.match(resultAction)
    },
    [dispatch]
  )

  const signOut = useCallback(() => {
    dispatch(logout())
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  return {
    user,
    token,
    isAuthenticated,
    isSeller: user?.role === 'seller',
    isLoading,
    error,
    login,
    register,
    signOut,
    clearError,
  }
}

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { authApi } from '../api/authApi.js';
import { profileReceived, sessionCleared, sessionFailed } from '../state/authSlice.js';
import { refreshSession, useSessionRequest } from '../../../shared/hooks/useSessionRequest.js';
import { errorMessage } from '../../../shared/api/http.js';

export function useBootstrapSession() {
  const store = useStore();
  const dispatch = useDispatch();
  const restore = useCallback(async () => {
    try {
      await refreshSession(store);
    } catch (error) {
      if (error.response?.status !== 401) dispatch(sessionFailed(errorMessage(error)));
    }
  }, [store, dispatch]);
  useEffect(() => { void restore(); }, [restore]);
  return restore;
}

export function useAuth() {
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const request = useSessionRequest();
  const [logoutState, setLogoutState] = useState({ loading: false, error: null });
  const logout = async () => {
    setLogoutState({ loading: true, error: null });
    try {
      await request(authApi.logout);
      dispatch(sessionCleared());
      setLogoutState({ loading: false, error: null });
    } catch (error) {
      setLogoutState({ loading: false, error: errorMessage(error) });
    }
  };
  const reloadProfile = useCallback(async () => {
    const profile = await request(authApi.me);
    dispatch(profileReceived(profile));
  }, [request, dispatch]);
  return { ...auth, logout, logoutState, reloadProfile };
}

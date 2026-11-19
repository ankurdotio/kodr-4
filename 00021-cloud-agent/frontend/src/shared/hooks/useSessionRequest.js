import { useCallback } from 'react';
import { useStore } from 'react-redux';
import { authApi } from '../../features/auth/api/authApi.js';
import { sessionReceived, sessionCleared } from '../../features/auth/state/authSlice.js';

let refreshInFlight = null;

export function refreshSession(store) {
  if (!refreshInFlight) {
    refreshInFlight = authApi.refresh()
      .then(data => {
        store.dispatch(sessionReceived(data));
        return data.accessToken;
      })
      .catch(error => {
        if (error.response?.status === 401) store.dispatch(sessionCleared());
        throw error;
      })
      .finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

export function useSessionRequest() {
  const store = useStore();
  return useCallback(async operation => {
    const token = store.getState().auth.accessToken || await refreshSession(store);
    try {
      return await operation(token);
    } catch (error) {
      if (error.response?.status !== 401) throw error;
      // Another request may already have rotated the token while this one was in flight.
      const current = store.getState().auth.accessToken;
      const renewed = current && current !== token ? current : await refreshSession(store);
      try {
        return await operation(renewed);
      } catch (retryError) {
        if (retryError.response?.status === 401) store.dispatch(sessionCleared());
        throw retryError;
      }
    }
  }, [store]);
}

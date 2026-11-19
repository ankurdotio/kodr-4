import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { activityApi } from '../api/activityApi.js';
import { activityLoading, activityReceived, activityFailed } from '../state/activitySlice.js';
import { useSessionRequest } from '../../../shared/hooks/useSessionRequest.js';
import { errorMessage } from '../../../shared/api/http.js';

export function useActivity() {
  const state = useSelector(state => state.activity);
  const installationId = useSelector(state => state.auth.user?.installationId);
  const dispatch = useDispatch();
  const request = useSessionRequest();
  const reload = useCallback(async () => {
    dispatch(activityLoading());
    try {
      dispatch(activityReceived(await request(activityApi.list)));
    } catch (error) {
      dispatch(activityFailed(errorMessage(error)));
    }
  }, [dispatch, request]);
  useEffect(() => { void reload(); }, [reload, installationId]);
  return { ...state, reload };
}

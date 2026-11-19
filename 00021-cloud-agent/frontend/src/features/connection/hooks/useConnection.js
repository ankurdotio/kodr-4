import { useDispatch, useSelector } from 'react-redux';
import { connectionApi } from '../api/connectionApi.js';
import { connectionLoading, connectionFailed } from '../state/connectionSlice.js';
import { useSessionRequest } from '../../../shared/hooks/useSessionRequest.js';
import { errorMessage } from '../../../shared/api/http.js';

export function useConnection() {
  const connection = useSelector(state => state.connection);
  const dispatch = useDispatch();
  const request = useSessionRequest();
  const connect = async () => {
    dispatch(connectionLoading());
    try {
      const { url } = await request(connectionApi.connect);
      window.location.assign(url);
    } catch (error) {
      dispatch(connectionFailed(errorMessage(error)));
    }
  };
  return { ...connection, connect };
}

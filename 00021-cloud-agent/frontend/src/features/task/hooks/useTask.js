import { useCallback, useEffect, useState } from 'react';
import { useSessionRequest } from '../../../shared/hooks/useSessionRequest.js';
import { errorMessage } from '../../../shared/api/http.js';
import { readTaskEvents, taskApi } from '../api/taskApi.js';

export function useRepositories() {
  const request = useSessionRequest();
  const [state, setState] = useState({ repositories: [], loading: true, error: null });
  const reload = useCallback(() => request(taskApi.repositories).then(
    repositories => setState({ repositories, loading: false, error: null }),
    error => setState({ repositories: [], loading: false, error: errorMessage(error) }),
  ), [request]);
  useEffect(() => { void reload(); }, [reload]);
  return { ...state, reload };
}

export function useTaskEvents(taskId) {
  const request = useSessionRequest();
  const [task, setTask] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let cursor = '';
    let completed = false;
    const connect = async () => {
      while (!controller.signal.aborted && !completed) {
        try {
          const response = await request(token => taskApi.events(token, taskId, cursor, controller.signal));
          if (controller.signal.aborted) return;
          setConnected(true);
          setError(null);
          await readTaskEvents(response, event => {
            if (controller.signal.aborted) return;
            if (event.type === 'task' || event.type === 'done') setTask(event.data);
            if (event.type === 'log') {
              if (event.id) cursor = event.id;
              setEvents(previous => [...previous, event].slice(-1000));
            }
            if (event.type === 'done') completed = true;
            if (event.type === 'error') throw new Error(event.data.message);
          });
        } catch (failure) {
          if (controller.signal.aborted) return;
          setError(failure.response ? errorMessage(failure) : failure.message);
          if ([401, 403, 404, 422].includes(failure.response?.status)) return;
        }
        if (!controller.signal.aborted) setConnected(false);
        if (!completed) await new Promise(resolve => setTimeout(resolve, 2000));
      }
    };
    void connect();
    return () => controller.abort();
  }, [request, taskId]);
  return { task, events, error, connected };
}

import { bearer, http } from '../../../shared/api/http.js';

export const taskApi = {
  async repositories(token) {
    return (await http.get('/task/github/repos', bearer(token))).data.data.repositories;
  },
  async create(token, input) {
    return (await http.post('/task', input, { ...bearer(token), timeout: 60000 })).data.data.task;
  },
  async events(token, taskId, cursor, signal) {
    const response = await fetch(`/api/v1/task/event/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`, Accept: 'text/event-stream',
        ...(cursor ? { 'Last-Event-ID': cursor } : {}),
      },
      signal,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw Object.assign(new Error(data.message || `Task event request failed (${response.status})`), {
        response: { status: response.status, data },
      });
    }
    return response;
  },
};

export async function readTaskEvents(response, onEvent) {
  if (!response.body || !response.headers.get('content-type')?.includes('text/event-stream')) {
    throw new Error('The server did not return a task event stream');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      let end;
      while ((end = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        const lines = frame.split('\n');
        const data = lines.filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
        if (!data) continue;
        onEvent({
          type: lines.find(line => line.startsWith('event:'))?.slice(6).trim() || 'message',
          id: lines.find(line => line.startsWith('id:'))?.slice(3).trim(),
          data: JSON.parse(data),
        });
      }
    }
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
}

import { http, bearer } from '../../../shared/api/http.js';

export const authApi = {
  refresh: () => http.post('/auth/refresh').then(res => res.data.data),
  me: token => http.get('/auth/me', bearer(token)).then(res => res.data.data),
  logout: token => http.post('/auth/logout', {}, bearer(token)).then(res => res.data.data),
};

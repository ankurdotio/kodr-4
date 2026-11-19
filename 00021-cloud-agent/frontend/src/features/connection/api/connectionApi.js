import { http, bearer } from '../../../shared/api/http.js';

export const connectionApi = {
  connect: token => http.post('/auth/github/connect', {}, bearer(token)).then(res => res.data.data),
};

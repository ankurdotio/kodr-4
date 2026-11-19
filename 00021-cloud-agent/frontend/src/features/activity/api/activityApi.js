import { http, bearer } from '../../../shared/api/http.js';

export const activityApi = {
  list: token => http.get('/activity', bearer(token)).then(res => res.data.data),
};

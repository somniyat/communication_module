import { http } from '../../../shared/lib/http';

export const communicationApi = {
  list:  (params) => http.get('/communications', { params }).then((r) => ({ items: r.data.data, meta: r.data.meta })),
  get:   (id)     => http.get(`/communications/${id}`).then((r) => r.data.data),
  stats: (params) => http.get('/communications/stats', { params }).then((r) => r.data.data),
  remove: (id)    => http.delete(`/communications/${id}`).then((r) => r.data),
  bulkDelete: (body) => http.post('/communications/bulk-delete', body).then((r) => r.data.data),
};

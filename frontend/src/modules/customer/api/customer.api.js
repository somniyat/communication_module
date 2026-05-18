import { http } from '../../../shared/lib/http';

export const customerApi = {
  list:   (params) => http.get('/customers', { params }).then((r) => r.data.data),
  get:    (id)     => http.get(`/customers/${id}`).then((r) => r.data.data),
  create: (body)   => http.post('/customers', body).then((r) => r.data.data),
  update: (id, b)  => http.put(`/customers/${id}`, b).then((r) => r.data.data),
  remove: (id)     => http.delete(`/customers/${id}`).then((r) => r.data),
};

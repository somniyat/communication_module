import { http } from '../../../shared/lib/http';

export const authApi = {
  login:    (payload) => http.post('/auth/login', payload).then((r) => r.data.data),
  register: (payload) => http.post('/auth/register', payload).then((r) => r.data.data),
  me:       ()        => http.get('/auth/me').then((r) => r.data.data),
};

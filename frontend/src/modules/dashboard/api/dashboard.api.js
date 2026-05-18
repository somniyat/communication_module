import { http } from '../../../shared/lib/http';

export const dashboardApi = {
  stats: () => http.get('/communications/stats').then((r) => r.data.data),
};

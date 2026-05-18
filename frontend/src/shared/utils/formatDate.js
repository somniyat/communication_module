import dayjs from 'dayjs';

export const formatDate = (d) => (d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '—');
export const formatDateTime = (d) => (d ? dayjs(d).format('YYYY-MM-DD HH:mm:ss') : '—');

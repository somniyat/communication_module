export const STATUSES = {
  pending: { label: 'Pending', severity: 'info' },
  sent:    { label: 'Sent',    severity: 'success' },
  notsent: { label: 'Failed',  severity: 'danger' },
};

export const STATUS_KEYS = Object.keys(STATUSES);

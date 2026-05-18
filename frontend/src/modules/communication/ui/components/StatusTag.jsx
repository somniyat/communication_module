import { Tag } from 'primereact/tag';
import { STATUSES } from '../../../../shared/constants/statuses';

export default function StatusTag({ value }) {
  const meta = STATUSES[value] || { label: value, severity: 'info' };
  return <Tag value={meta.label} severity={meta.severity} />;
}

import { CHANNELS } from '../../../../shared/constants/channels';

export default function TypeIcon({ type, withLabel = true, size = 18 }) {
  const meta = CHANNELS[type];
  if (!meta) return <span>{type}</span>;
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-2">
      <Icon size={size} color={meta.color} />
      {withLabel && <span>{meta.label}</span>}
    </span>
  );
}

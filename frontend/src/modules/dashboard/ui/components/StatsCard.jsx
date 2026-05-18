import { Card } from 'primereact/card';

export default function StatsCard({ title, value, icon, color }) {
  return (
    <Card className="shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">{title}</div>
          <div className="text-3xl font-semibold mt-1">{value}</div>
        </div>
        {icon && <i className={`pi ${icon} text-3xl`} style={{ color }} />}
      </div>
    </Card>
  );
}

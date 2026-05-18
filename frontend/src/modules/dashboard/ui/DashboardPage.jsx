import { useEffect, useMemo } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchStats } from '../slice/dashboard.slice';
import StatsCard from './components/StatsCard';
import { CHANNELS, CHANNEL_KEYS } from '../../../shared/constants/channels';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { stats, status } = useAppSelector((s) => s.dashboard);

  useEffect(() => { dispatch(fetchStats()); }, [dispatch]);

  const totals = useMemo(() => {
    const t = { sent: 0, notsent: 0, pending: 0 };
    const byType = {};
    for (const row of stats) {
      const { status: st, type } = row._id || {};
      if (st && t[st] !== undefined) t[st] += row.count;
      if (type) byType[type] = (byType[type] || 0) + row.count;
    }
    return { t, byType };
  }, [stats]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button icon="pi pi-refresh" label="Refresh" outlined loading={status === 'loading'} onClick={() => dispatch(fetchStats())} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard title="Sent"    value={totals.t.sent}    icon="pi-check-circle"  color="#10b981" />
        <StatsCard title="Failed"  value={totals.t.notsent} icon="pi-times-circle"  color="#ef4444" />
        <StatsCard title="Pending" value={totals.t.pending} icon="pi-clock"         color="#f59e0b" />
      </div>

      <Card title="By channel">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {CHANNEL_KEYS.map((k) => {
            const meta = CHANNELS[k];
            const Icon = meta.icon;
            return (
              <div key={k} className="flex flex-col items-center p-3 border rounded">
                <Icon size={28} color={meta.color} />
                <div className="text-xs text-gray-500 mt-2">{meta.label}</div>
                <div className="text-xl font-semibold">{totals.byType[k] || 0}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

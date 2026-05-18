import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { setFilters, resetFilters } from '../../slice/communication.slice';
import { fetchCommunications } from '../../slice/communication.thunks';
import { CHANNEL_KEYS, CHANNELS } from '../../../../shared/constants/channels';
import { STATUS_KEYS, STATUSES } from '../../../../shared/constants/statuses';

const typeOptions = [{ label: 'All types', value: null }, ...CHANNEL_KEYS.map((k) => ({ label: CHANNELS[k].label, value: k }))];
const statusOptions = [{ label: 'All statuses', value: null }, ...STATUS_KEYS.map((k) => ({ label: STATUSES[k].label, value: k }))];

export default function CommunicationFilters() {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((s) => s.communication);
  const { items: customers } = useAppSelector((s) => s.customer);

  const customerOptions = [
    { label: 'All customers', value: null },
    ...customers.map((c) => ({ label: c.name, value: c.id })),
  ];

  const apply = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== null && v !== ''));
    dispatch(fetchCommunications(params));
  };

  const reset = () => {
    dispatch(resetFilters());
    dispatch(fetchCommunications());
  };

  const update = (k, v) => dispatch(setFilters({ [k]: v }));

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      <Field label="Customer">
        <Dropdown value={filters.customerId} options={customerOptions} onChange={(e) => update('customerId', e.value)} placeholder="All customers" className="w-56" />
      </Field>
      <Field label="Type">
        <Dropdown value={filters.type} options={typeOptions} onChange={(e) => update('type', e.value)} placeholder="All types" className="w-40" />
      </Field>
      <Field label="Status">
        <Dropdown value={filters.status} options={statusOptions} onChange={(e) => update('status', e.value)} placeholder="All statuses" className="w-40" />
      </Field>
      <Field label="comID">
        <InputText value={filters.comID || ''} onChange={(e) => update('comID', e.target.value)} className="w-48" />
      </Field>
      <div className="flex gap-2">
        <Button label="Apply" icon="pi pi-search" onClick={apply} />
        <Button label="Reset" icon="pi pi-times" severity="secondary" outlined onClick={reset} />
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-600 font-medium">{label}</label>
      {children}
    </div>
  );
}

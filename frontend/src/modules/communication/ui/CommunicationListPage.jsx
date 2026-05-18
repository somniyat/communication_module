import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchCommunications } from '../slice/communication.thunks';
import { fetchCustomers } from '../../customer/slice/customer.thunks';
import { formatDate } from '../../../shared/utils/formatDate';
import StatusTag from './components/StatusTag';
import TypeIcon from './components/TypeIcon';
import CommunicationFilters from './components/CommunicationFilters';

export default function CommunicationListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, status, meta } = useAppSelector((s) => s.communication);
  const customers = useAppSelector((s) => s.customer.items);

  useEffect(() => {
    if (!customers.length) dispatch(fetchCustomers());
    dispatch(fetchCommunications());
  }, [dispatch, customers.length]);

  const customerName = (id) => customers.find((c) => c.id === id)?.name || id;

  const onPage = (e) => {
    dispatch(fetchCommunications({ skip: e.first, limit: e.rows }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Communications</h1>
        <Button icon="pi pi-refresh" label="Refresh" outlined onClick={() => dispatch(fetchCommunications())} />
      </div>

      <CommunicationFilters />

      <DataTable
        value={items}
        loading={status === 'loading'}
        paginator
        lazy
        first={meta.skip}
        rows={meta.limit}
        totalRecords={meta.total}
        onPage={onPage}
        dataKey="id"
        emptyMessage="No communications yet."
        onRowClick={(e) => navigate(`/communications/${e.data.id}`)}
        rowClassName={() => 'cursor-pointer'}
      >
        <Column field="comID" header="comID" />
        <Column header="Customer" body={(r) => customerName(r.customerId)} />
        <Column header="Type" body={(r) => <TypeIcon type={r.type} />} />
        <Column header="Status" body={(r) => <StatusTag value={r.status} />} />
        <Column header="Recipient" body={(r) => r.email || r.phoneNumber || r.fcmToken || '—'} />
        <Column header="Sent at" body={(r) => formatDate(r.sentAt)} />
        <Column header="Created" body={(r) => formatDate(r.createdAt)} />
      </DataTable>
    </div>
  );
}

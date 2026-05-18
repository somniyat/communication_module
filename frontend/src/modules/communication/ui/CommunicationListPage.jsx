import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  fetchCommunications,
  bulkDeleteCommunications,
  clearAllCommunications,
} from '../slice/communication.thunks';
import { fetchCustomers } from '../../customer/slice/customer.thunks';
import { formatDate } from '../../../shared/utils/formatDate';
import StatusTag from './components/StatusTag';
import TypeIcon from './components/TypeIcon';
import CommunicationFilters from './components/CommunicationFilters';

export default function CommunicationListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  const { items, status, meta, filters } = useAppSelector((s) => s.communication);
  const customers = useAppSelector((s) => s.customer.items);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!customers.length) dispatch(fetchCustomers());
    dispatch(fetchCommunications());
  }, [dispatch, customers.length]);

  const customerName = (id) => customers.find((c) => c.id === id)?.name || id;

  const onPage = (e) => {
    dispatch(fetchCommunications({ skip: e.first, limit: e.rows }));
  };

  const activeFilter = () => {
    return Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== null && v !== '')
    );
  };

  const confirmBulkDelete = () => {
    if (!selected.length) return;
    confirmDialog({
      message: `Delete ${selected.length} selected communication(s)? This cannot be undone.`,
      header: 'Confirm bulk delete',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        const ids = selected.map((c) => c.id);
        const res = await dispatch(bulkDeleteCommunications(ids));
        if (bulkDeleteCommunications.fulfilled.match(res)) {
          toast.current?.show({ severity: 'success', summary: `Deleted ${ids.length}` });
          setSelected([]);
          dispatch(fetchCommunications(activeFilter()));
        } else {
          toast.current?.show({ severity: 'error', summary: 'Error', detail: res.payload });
        }
      },
    });
  };

  const confirmClearAll = () => {
    const filter = activeFilter();
    const scope = Object.keys(filter).length ? 'matching the current filters' : 'in the database';
    confirmDialog({
      message: `Delete ALL communications ${scope}? This cannot be undone.`,
      header: 'Confirm clear all',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        const res = await dispatch(clearAllCommunications(filter));
        if (clearAllCommunications.fulfilled.match(res)) {
          toast.current?.show({
            severity: 'success',
            summary: `Deleted ${res.payload?.deletedCount || 0}`,
          });
          setSelected([]);
          dispatch(fetchCommunications(filter));
        } else {
          toast.current?.show({ severity: 'error', summary: 'Error', detail: res.payload });
        }
      },
    });
  };

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Communications</h1>
        <div className="flex gap-2">
          <Button
            label={`Delete selected${selected.length ? ` (${selected.length})` : ''}`}
            icon="pi pi-trash"
            severity="danger"
            outlined
            disabled={!selected.length}
            onClick={confirmBulkDelete}
          />
          <Button
            label="Clear all"
            icon="pi pi-times-circle"
            severity="danger"
            outlined
            disabled={!meta.total}
            onClick={confirmClearAll}
          />
          <Button icon="pi pi-refresh" label="Refresh" outlined onClick={() => dispatch(fetchCommunications(activeFilter()))} />
        </div>
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
        selectionMode="checkbox"
        selection={selected}
        onSelectionChange={(e) => setSelected(e.value)}
        onRowClick={(e) => navigate(`/communications/${e.data.id}`)}
        rowClassName={() => 'cursor-pointer'}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
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

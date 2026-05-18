import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  fetchCustomers,
  deleteCustomer,
  bulkDeleteCustomers,
  clearAllCustomers,
} from '../slice/customer.thunks';
import { formatDate } from '../../../shared/utils/formatDate';

export default function CustomerListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  const { items, status, error } = useAppSelector((s) => s.customer);
  const [selected, setSelected] = useState([]);

  useEffect(() => { dispatch(fetchCustomers()); }, [dispatch]);

  const confirmDelete = (row) => {
    confirmDialog({
      message: `Delete customer "${row.name}"? This cannot be undone.`,
      header: 'Confirm delete',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        const res = await dispatch(deleteCustomer(row.id));
        if (deleteCustomer.fulfilled.match(res)) {
          toast.current?.show({ severity: 'success', summary: 'Deleted', detail: row.name });
          setSelected((s) => s.filter((x) => x.id !== row.id));
        } else {
          toast.current?.show({ severity: 'error', summary: 'Error', detail: res.payload });
        }
      },
    });
  };

  const confirmBulkDelete = () => {
    if (!selected.length) return;
    confirmDialog({
      message: `Delete ${selected.length} selected customer(s)? This cannot be undone.`,
      header: 'Confirm bulk delete',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        const ids = selected.map((c) => c.id);
        const res = await dispatch(bulkDeleteCustomers(ids));
        if (bulkDeleteCustomers.fulfilled.match(res)) {
          toast.current?.show({ severity: 'success', summary: `Deleted ${ids.length}` });
          setSelected([]);
        } else {
          toast.current?.show({ severity: 'error', summary: 'Error', detail: res.payload });
        }
      },
    });
  };

  const confirmClearAll = () => {
    confirmDialog({
      message: `Delete ALL ${items.length} customer(s)? This cannot be undone.`,
      header: 'Confirm clear all',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        const res = await dispatch(clearAllCustomers());
        if (clearAllCustomers.fulfilled.match(res)) {
          toast.current?.show({ severity: 'success', summary: 'All customers deleted' });
          setSelected([]);
        } else {
          toast.current?.show({ severity: 'error', summary: 'Error', detail: res.payload });
        }
      },
    });
  };

  const actionsBody = (row) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" rounded text onClick={(e) => { e.stopPropagation(); navigate(`/customers/${row.id}`); }} />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={(e) => { e.stopPropagation(); confirmDelete(row); }} />
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Customers</h1>
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
            disabled={!items.length}
            onClick={confirmClearAll}
          />
          <Button label="New customer" icon="pi pi-plus" onClick={() => navigate('/customers/new')} />
        </div>
      </div>

      {error && <div className="mb-3 text-red-600">{error}</div>}

      <DataTable
        value={items}
        loading={status === 'loading'}
        paginator
        rows={10}
        dataKey="id"
        emptyMessage="No customers yet."
        selectionMode="checkbox"
        selection={selected}
        onSelectionChange={(e) => setSelected(e.value)}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column field="id" header="id" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
        <Column field="name" header="Name" sortable />
        <Column header="Status" body={(r) => <Tag value={r.active ? 'Active' : 'Inactive'} severity={r.active ? 'success' : 'secondary'} />} />
        <Column header="Fetch API" body={(r) => r.communicationFetchApi?.url || <span className="text-gray-400">—</span>} />
        <Column header="Update API" body={(r) => r.communicationUpdateApi?.url || <span className="text-gray-400">—</span>} />
        <Column header="Interval" body={(r) => (r.jobIntervalMs ? `${r.jobIntervalMs} ms` : 'default')} />
        <Column header="Updated" body={(r) => formatDate(r.updatedAt)} />
        <Column header="Actions" body={actionsBody} style={{ width: '130px' }} />
      </DataTable>
    </div>
  );
}

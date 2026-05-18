import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchCustomer, createCustomer, updateCustomer } from '../slice/customer.thunks';
import { clearSelected } from '../slice/customer.slice';
import CustomerConfigForm from './components/CustomerConfigForm';

export default function CustomerFormPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useRef(null);
  const { selected, status } = useAppSelector((s) => s.customer);
  const isNew = !id || id === 'new';

  useEffect(() => {
    if (!isNew) dispatch(fetchCustomer(id));
    return () => dispatch(clearSelected());
  }, [dispatch, id, isNew]);

  const submit = async (payload) => {
    const thunk = isNew ? createCustomer(payload) : updateCustomer({ id, body: payload });
    const matcher = isNew ? createCustomer.fulfilled : updateCustomer.fulfilled;
    const res = await dispatch(thunk);
    if (matcher.match(res)) {
      toast.current?.show({ severity: 'success', summary: 'Saved' });
      navigate('/customers');
    } else {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: res.payload });
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <Card title={isNew ? 'New customer' : `Edit: ${selected?.name || ''}`}>
        <CustomerConfigForm
          initial={isNew ? null : selected}
          submitting={status === 'loading'}
          onSubmit={submit}
          onCancel={() => navigate('/customers')}
        />
      </Card>
    </div>
  );
}

import { createAsyncThunk } from '@reduxjs/toolkit';
import { customerApi } from '../api/customer.api';
import { apiError } from '../../../shared/lib/http';

const wrap = (name, fn) =>
  createAsyncThunk(`customer/${name}`, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (err) {
      return rejectWithValue(apiError(err));
    }
  });

export const fetchCustomers = wrap('list', (params) => customerApi.list(params));
export const fetchCustomer  = wrap('get', (id) => customerApi.get(id));
export const createCustomer = wrap('create', (body) => customerApi.create(body));
export const updateCustomer = wrap('update', ({ id, body }) => customerApi.update(id, body));
export const deleteCustomer = wrap('remove', (id) => customerApi.remove(id).then(() => id));
export const bulkDeleteCustomers = wrap('bulkDelete', async (ids) => {
  await customerApi.bulkDelete({ ids });
  return ids;
});
export const clearAllCustomers = wrap('clearAll', async () => {
  await customerApi.bulkDelete({ all: true });
  return true;
});

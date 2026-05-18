import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCustomers,
  fetchCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from './customer.thunks';

const initialState = {
  items: [],
  selected: null,
  status: 'idle',
  error: null,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearSelected(state) {
      state.selected = null;
    },
    clearCustomerError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchCustomers.fulfilled, (s, a) => { s.status = 'succeeded'; s.items = a.payload; })
      .addCase(fetchCustomers.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; })

      .addCase(fetchCustomer.fulfilled, (s, a) => { s.selected = a.payload; })

      .addCase(createCustomer.fulfilled, (s, a) => { s.items.unshift(a.payload); })

      .addCase(updateCustomer.fulfilled, (s, a) => {
        const idx = s.items.findIndex((c) => c.id === a.payload.id);
        if (idx >= 0) s.items[idx] = a.payload;
        if (s.selected && s.selected.id === a.payload.id) s.selected = a.payload;
      })

      .addCase(deleteCustomer.fulfilled, (s, a) => {
        s.items = s.items.filter((c) => c.id !== a.payload);
      });
  },
});

export const { clearSelected, clearCustomerError } = customerSlice.actions;
export default customerSlice.reducer;

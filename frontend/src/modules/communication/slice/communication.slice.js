import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCommunications,
  fetchCommunication,
  deleteCommunication,
  bulkDeleteCommunications,
  clearAllCommunications,
} from './communication.thunks';

const initialState = {
  items: [],
  meta: { total: 0, limit: 50, skip: 0 },
  filters: { customerId: null, status: null, type: null, comID: '' },
  selected: null,
  status: 'idle',
  error: null,
};

const communicationSlice = createSlice({
  name: 'communication',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    clearSelectedCommunication(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunications.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchCommunications.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.items = a.payload.items;
        s.meta = a.payload.meta;
      })
      .addCase(fetchCommunications.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; })

      .addCase(fetchCommunication.fulfilled, (s, a) => { s.selected = a.payload; })

      .addCase(deleteCommunication.fulfilled, (s, a) => {
        s.items = s.items.filter((c) => c.id !== a.payload);
        s.meta.total = Math.max(0, s.meta.total - 1);
      })

      .addCase(bulkDeleteCommunications.fulfilled, (s, a) => {
        const removed = new Set(a.payload);
        const before = s.items.length;
        s.items = s.items.filter((c) => !removed.has(c.id));
        s.meta.total = Math.max(0, s.meta.total - (before - s.items.length));
      })

      .addCase(clearAllCommunications.fulfilled, (s, a) => {
        const deleted = a.payload?.deletedCount || 0;
        s.items = [];
        s.meta.total = Math.max(0, s.meta.total - deleted);
      });
  },
});

export const { setFilters, resetFilters, clearSelectedCommunication } = communicationSlice.actions;
export default communicationSlice.reducer;

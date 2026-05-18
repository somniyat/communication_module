import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '../api/dashboard.api';
import { apiError } from '../../../shared/lib/http';

export const fetchStats = createAsyncThunk('dashboard/stats', async (_, { rejectWithValue }) => {
  try {
    return await dashboardApi.stats();
  } catch (err) {
    return rejectWithValue(apiError(err));
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { stats: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending,   (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchStats.fulfilled, (s, a) => { s.status = 'succeeded'; s.stats = a.payload; })
      .addCase(fetchStats.rejected,  (s, a) => { s.status = 'failed'; s.error = a.payload; });
  },
});

export default dashboardSlice.reducer;

import { createAsyncThunk } from '@reduxjs/toolkit';
import { communicationApi } from '../api/communication.api';
import { apiError } from '../../../shared/lib/http';

export const fetchCommunications = createAsyncThunk(
  'communication/list',
  async (params, { rejectWithValue }) => {
    try {
      return await communicationApi.list(params);
    } catch (err) {
      return rejectWithValue(apiError(err));
    }
  }
);

export const fetchCommunication = createAsyncThunk(
  'communication/get',
  async (id, { rejectWithValue }) => {
    try {
      return await communicationApi.get(id);
    } catch (err) {
      return rejectWithValue(apiError(err));
    }
  }
);

export const deleteCommunication = createAsyncThunk(
  'communication/remove',
  async (id, { rejectWithValue }) => {
    try {
      await communicationApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(apiError(err));
    }
  }
);

export const bulkDeleteCommunications = createAsyncThunk(
  'communication/bulkDelete',
  async (ids, { rejectWithValue }) => {
    try {
      await communicationApi.bulkDelete({ ids });
      return ids;
    } catch (err) {
      return rejectWithValue(apiError(err));
    }
  }
);

export const clearAllCommunications = createAsyncThunk(
  'communication/clearAll',
  async (filter = {}, { rejectWithValue }) => {
    try {
      const result = await communicationApi.bulkDelete({ all: true, filter });
      return result;
    } catch (err) {
      return rejectWithValue(apiError(err));
    }
  }
);

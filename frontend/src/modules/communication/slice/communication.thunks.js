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

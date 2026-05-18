import { createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../api/auth.api';
import { setToken, clearToken } from '../../../shared/lib/storage';
import { apiError } from '../../../shared/lib/http';

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const data = await authApi.login(payload);
    setToken(data.token);
    return data;
  } catch (err) {
    return rejectWithValue(apiError(err));
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const data = await authApi.register(payload);
    setToken(data.token);
    return data;
  } catch (err) {
    return rejectWithValue(apiError(err));
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    return await authApi.me();
  } catch (err) {
    clearToken();
    return rejectWithValue(apiError(err));
  }
});

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/slice/auth.slice';
import customerReducer from '../modules/customer/slice/customer.slice';
import communicationReducer from '../modules/communication/slice/communication.slice';
import dashboardReducer from '../modules/dashboard/slice/dashboard.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    communication: communicationReducer,
    dashboard: dashboardReducer,
  },
});

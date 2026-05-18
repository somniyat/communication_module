import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AppShell from './shared/components/Layout/AppShell';

import { LoginPage, RegisterPage } from './modules/auth';
import { DashboardPage } from './modules/dashboard';
import { CustomerListPage, CustomerFormPage } from './modules/customer';
import { CommunicationListPage, CommunicationDetailPage } from './modules/communication';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/communications" element={<CommunicationListPage />} />
        <Route path="/communications/:id" element={<CommunicationDetailPage />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/new" element={<CustomerFormPage />} />
        <Route path="/customers/:id" element={<CustomerFormPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

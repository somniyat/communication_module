import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

export default function ProtectedRoute({ children }) {
  const { token, user, status } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (status === 'loading' && !user) return null;
  return children;
}

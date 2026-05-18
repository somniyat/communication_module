import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AppRoutes from './routes';
import { fetchMe } from './modules/auth/slice/auth.thunks';
import { getToken } from './shared/lib/storage';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (getToken()) {
      dispatch(fetchMe());
    }
  }, [dispatch]);

  return <AppRoutes />;
}

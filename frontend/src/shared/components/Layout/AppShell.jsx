import { Outlet, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { logout } from '../../../modules/auth/slice/auth.slice';

export default function AppShell() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const items = [
    { label: 'Dashboard',      icon: 'pi pi-home',     command: () => navigate('/') },
    { label: 'Communications', icon: 'pi pi-send',     command: () => navigate('/communications') },
    { label: 'Customers',      icon: 'pi pi-building', command: () => navigate('/customers') },
  ];

  const end = (
    <div className="flex items-center gap-3 pr-3">
      <span className="text-sm text-gray-600">{user?.email}</span>
      <Button
        icon="pi pi-sign-out"
        label="Logout"
        size="small"
        severity="secondary"
        outlined
        onClick={() => {
          dispatch(logout());
          navigate('/login');
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Menubar
        model={items}
        end={end}
        start={<span className="font-semibold text-indigo-600 px-3">Communication Module</span>}
      />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

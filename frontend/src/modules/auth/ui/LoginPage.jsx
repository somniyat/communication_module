import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { login } from '../slice/auth.thunks';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(login({ email, password }));
    if (login.fulfilled.match(res)) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card title="Sign in" className="w-full max-w-md">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {error && <Message severity="error" text={error} />}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <InputText id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <Password id="password" value={password} onChange={(e) => setPassword(e.target.value)} feedback={false} toggleMask required />
          </div>
          <Button type="submit" label="Sign in" icon="pi pi-sign-in" loading={status === 'loading'} />
          <p className="text-sm text-center text-gray-600">
            No account? <Link to="/register" className="text-indigo-600 hover:underline">Create one</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}

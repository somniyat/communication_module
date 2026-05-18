import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { register } from '../slice/auth.thunks';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(register(form));
    if (register.fulfilled.match(res)) navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card title="Create account" className="w-full max-w-md">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {error && <Message severity="error" text={error} />}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Name</label>
            <InputText value={form.name} onChange={set('name')} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Email</label>
            <InputText type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Password</label>
            <Password value={form.password} onChange={set('password')} toggleMask required />
          </div>
          <Button type="submit" label="Create account" icon="pi pi-user-plus" loading={status === 'loading'} />
          <p className="text-sm text-center text-gray-600">
            Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}

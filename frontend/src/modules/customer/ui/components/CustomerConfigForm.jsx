import { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Chips } from 'primereact/chips';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Panel } from 'primereact/panel';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => ({ label: m, value: m }));

const emptyEndpoint = { url: '', method: 'GET', headers: {} };

const emptySmtp = { host: '', port: null, secure: false, user: '', rejectUnauthorized: true };

const blank = {
  name: '',
  noReplyEmail: '',
  defaultRecipientEmails: [],
  whatsappSenderPhone: '',
  smsSenderId: '',
  firebaseKey: '',
  smtp: { ...emptySmtp },
  withoutNotificationBody: false,
  communicationFetchApi: { ...emptyEndpoint },
  communicationUpdateApi: { ...emptyEndpoint, method: 'POST' },
  jobIntervalMs: null,
  active: true,
  notes: '',
};

const headersToText = (h) =>
  Object.entries(h || {}).map(([k, v]) => `${k}: ${v}`).join('\n');

const textToHeaders = (text) => {
  const out = {};
  String(text || '').split(/\r?\n/).forEach((line) => {
    const i = line.indexOf(':');
    if (i > 0) {
      const k = line.slice(0, i).trim();
      const v = line.slice(i + 1).trim();
      if (k) out[k] = v;
    }
  });
  return out;
};

export default function CustomerConfigForm({ initial, onSubmit, submitting, onCancel }) {
  const [form, setForm] = useState(blank);
  const [fetchHeaders, setFetchHeaders] = useState('');
  const [updateHeaders, setUpdateHeaders] = useState('');
  const [firebaseKeyText, setFirebaseKeyText] = useState('');
  const [smtpPassText, setSmtpPassText] = useState('');

  useEffect(() => {
    if (initial) {
      const merged = { ...blank, ...initial };
      merged.communicationFetchApi = { ...emptyEndpoint, ...(initial.communicationFetchApi || {}) };
      merged.communicationUpdateApi = { ...emptyEndpoint, method: 'POST', ...(initial.communicationUpdateApi || {}) };
      merged.smtp = { ...emptySmtp, ...(initial.smtp || {}) };
      // Existing customers don't return firebaseKey/smtp.pass, so leave blanks
      merged.firebaseKey = '';
      setForm(merged);
      setFetchHeaders(headersToText(merged.communicationFetchApi.headers));
      setUpdateHeaders(headersToText(merged.communicationUpdateApi.headers));
    }
  }, [initial]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const setEndpoint = (key, field, value) =>
    setForm((s) => ({ ...s, [key]: { ...s[key], [field]: value } }));
  const setSmtp = (field, value) =>
    setForm((s) => ({ ...s, smtp: { ...s.smtp, [field]: value } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      communicationFetchApi: { ...form.communicationFetchApi, headers: textToHeaders(fetchHeaders) },
      communicationUpdateApi: { ...form.communicationUpdateApi, headers: textToHeaders(updateHeaders) },
      smtp: { ...form.smtp },
    };
    if (smtpPassText.trim()) {
      payload.smtp.pass = smtpPassText.trim();
    } else {
      delete payload.smtp.pass;
    }
    if (firebaseKeyText.trim()) {
      try {
        payload.firebaseKey = JSON.parse(firebaseKeyText);
      } catch {
        payload.firebaseKey = firebaseKeyText;
      }
    } else {
      delete payload.firebaseKey;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Panel header="Identity">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name">
            <InputText value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </Field>
          <Field label="Active">
            <InputSwitch checked={form.active} onChange={(e) => set('active', e.value)} />
          </Field>
        </div>
      </Panel>

      <Panel header="Channel defaults">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="No-reply email">
            <InputText value={form.noReplyEmail} onChange={(e) => set('noReplyEmail', e.target.value)} />
          </Field>
          <Field label="Default recipient emails">
            <Chips value={form.defaultRecipientEmails} onChange={(e) => set('defaultRecipientEmails', e.value)} />
          </Field>
          <Field label="WhatsApp sender phone">
            <InputText value={form.whatsappSenderPhone} onChange={(e) => set('whatsappSenderPhone', e.target.value)} placeholder="+14155238886" />
          </Field>
          <Field label="SMS sender ID / phone">
            <InputText value={form.smsSenderId} onChange={(e) => set('smsSenderId', e.target.value)} />
          </Field>
          <Field label="Firebase service-account JSON" className="md:col-span-2">
            <InputTextarea
              value={firebaseKeyText}
              onChange={(e) => setFirebaseKeyText(e.target.value)}
              rows={5}
              placeholder='{"type":"service_account",...}'
              autoResize
            />
            {initial?.hasFirebaseKey && !firebaseKeyText && (
              <small className="text-gray-500">A key is currently stored. Paste a new one to replace it.</small>
            )}
          </Field>
          <Field label="Default: send push as data-only (without notification body)" className="md:col-span-2">
            <div className="flex items-center gap-3">
              <InputSwitch
                checked={!!form.withoutNotificationBody}
                onChange={(e) => set('withoutNotificationBody', e.value)}
              />
              <small className="text-gray-500">
                Applied when a communication does not set <code>without_notification_body</code> itself.
              </small>
            </div>
          </Field>
        </div>
      </Panel>

      <Panel header="SMTP (overrides global .env config)">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Host" className="md:col-span-2">
            <InputText value={form.smtp.host} onChange={(e) => setSmtp('host', e.target.value)} placeholder="smtp.example.com (leave blank to use global)" />
          </Field>
          <Field label="Port">
            <InputNumber value={form.smtp.port} onValueChange={(e) => setSmtp('port', e.value)} placeholder="587" min={1} max={65535} useGrouping={false} />
          </Field>
          <Field label="Secure (TLS)">
            <InputSwitch checked={!!form.smtp.secure} onChange={(e) => setSmtp('secure', e.value)} />
          </Field>
          <Field label="User" className="md:col-span-2">
            <InputText value={form.smtp.user} onChange={(e) => setSmtp('user', e.target.value)} placeholder="user@example.com" />
          </Field>
          <Field label="Password" className="md:col-span-2">
            <InputText
              type="password"
              value={smtpPassText}
              onChange={(e) => setSmtpPassText(e.target.value)}
              placeholder={initial?.smtp?.hasPass ? '••••••• (stored — paste to replace)' : 'Password'}
            />
          </Field>
          <Field label="Reject unauthorized TLS" className="md:col-span-4">
            <div className="flex items-center gap-3">
              <InputSwitch checked={!!form.smtp.rejectUnauthorized} onChange={(e) => setSmtp('rejectUnauthorized', e.value)} />
              <small className="text-gray-500">Disable if your SMTP server uses a self-signed certificate.</small>
            </div>
          </Field>
        </div>
      </Panel>

      <Panel header="Fetch API (where to pull communications from)">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="URL" className="md:col-span-3">
            <InputText value={form.communicationFetchApi.url} onChange={(e) => setEndpoint('communicationFetchApi', 'url', e.target.value)} placeholder="https://your-app.com/api/comms/pending" />
          </Field>
          <Field label="Method">
            <Dropdown value={form.communicationFetchApi.method} options={HTTP_METHODS} onChange={(e) => setEndpoint('communicationFetchApi', 'method', e.value)} />
          </Field>
          <Field label="Headers (one per line, Key: Value)" className="md:col-span-4">
            <InputTextarea value={fetchHeaders} onChange={(e) => setFetchHeaders(e.target.value)} rows={3} placeholder="Authorization: Bearer ..." />
          </Field>
        </div>
      </Panel>

      <Panel header="Update API (where to report delivery results)">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="URL" className="md:col-span-3">
            <InputText value={form.communicationUpdateApi.url} onChange={(e) => setEndpoint('communicationUpdateApi', 'url', e.target.value)} placeholder="https://your-app.com/api/comms/ack (optional)" />
          </Field>
          <Field label="Method">
            <Dropdown value={form.communicationUpdateApi.method} options={HTTP_METHODS} onChange={(e) => setEndpoint('communicationUpdateApi', 'method', e.value)} />
          </Field>
          <Field label="Headers (one per line, Key: Value)" className="md:col-span-4">
            <InputTextarea value={updateHeaders} onChange={(e) => setUpdateHeaders(e.target.value)} rows={3} />
          </Field>
        </div>
      </Panel>

      <Panel header="Scheduler">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Job interval (ms) — leave blank for default">
            <InputNumber value={form.jobIntervalMs} onValueChange={(e) => set('jobIntervalMs', e.value)} min={100} max={3600000} />
          </Field>
          <Field label="Notes">
            <InputText value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </Field>
        </div>
      </Panel>

      <div className="flex gap-2 justify-end">
        {onCancel && <Button type="button" label="Cancel" severity="secondary" outlined onClick={onCancel} />}
        <Button type="submit" label="Save" icon="pi pi-check" loading={submitting} />
      </div>
    </form>
  );
}

function Field({ label, className, children }) {
  return (
    <div className={`flex flex-col gap-1 ${className || ''}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

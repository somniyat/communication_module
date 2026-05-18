import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchCommunication } from '../slice/communication.thunks';
import { clearSelectedCommunication } from '../slice/communication.slice';
import StatusTag from './components/StatusTag';
import TypeIcon from './components/TypeIcon';
import { formatDateTime } from '../../../shared/utils/formatDate';

export default function CommunicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selected } = useAppSelector((s) => s.communication);

  useEffect(() => {
    dispatch(fetchCommunication(id));
    return () => dispatch(clearSelectedCommunication());
  }, [dispatch, id]);

  if (!selected) return <div>Loading…</div>;

  return (
    <div>
      <Button icon="pi pi-arrow-left" label="Back" text onClick={() => navigate(-1)} className="mb-3" />
      <Card title={`comID: ${selected.comID}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Info label="Type"><TypeIcon type={selected.type} /></Info>
          <Info label="Status"><StatusTag value={selected.status} /></Info>
          <Info label="Subject">{selected.subject || '—'}</Info>
          <Info label="Recipient">{selected.email || selected.phoneNumber || selected.fcmToken || '—'}</Info>
          <Info label="Attempts">{selected.attempts}</Info>
          <Info label="Sent at">{formatDateTime(selected.sentAt)}</Info>
          <Info label="Update ACK">{formatDateTime(selected.updateAckAt)}</Info>
          <Info label="Created">{formatDateTime(selected.createdAt)}</Info>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Message</h3>
          <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap text-sm">{selected.message || '—'}</pre>
        </div>

        {selected.files?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Files</h3>
            <ul className="list-disc list-inside text-sm">
              {selected.files.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}

        {selected.error && (
          <div className="mt-6">
            <Message severity="error" text={selected.error} />
          </div>
        )}
      </Card>
    </div>
  );
}

function Info({ label, children }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-sm mt-1">{children}</div>
    </div>
  );
}

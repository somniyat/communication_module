import { MdEmail, MdSms, MdNotificationsActive, MdWhatsapp, MdPerson } from 'react-icons/md';

export const CHANNELS = {
  email:        { label: 'Email',        icon: MdEmail,               color: '#3b82f6' },
  sms:          { label: 'SMS',          icon: MdSms,                 color: '#10b981' },
  whatsapp:     { label: 'WhatsApp',     icon: MdWhatsapp,            color: '#22c55e' },
  notification: { label: 'Push',         icon: MdNotificationsActive, color: '#f59e0b' },
  user:         { label: 'In-app',       icon: MdPerson,              color: '#8b5cf6' },
};

export const CHANNEL_KEYS = Object.keys(CHANNELS);

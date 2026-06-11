const RAW_AR_BASE_URL = import.meta.env.VITE_AR_BASE_URL || '';
const AR_HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const PAGE_PROTOCOL = typeof window !== 'undefined' ? window.location.protocol : 'http:';
const AR_PROTOCOL = PAGE_PROTOCOL === 'https:' ? 'https' : 'http';
const AR_WS_PROTOCOL = PAGE_PROTOCOL === 'https:' ? 'wss' : 'ws';

const normalizedArBase = RAW_AR_BASE_URL
  ? RAW_AR_BASE_URL.replace(/\/$/, '')
  : '';
const AR_BASE_URL = normalizedArBase || `${AR_PROTOCOL}://${AR_HOST}:8000`;

const RAW_AR_WS_URL = import.meta.env.VITE_AR_WS_URL || '';
const normalizedArWs = RAW_AR_WS_URL
  ? RAW_AR_WS_URL.replace(/\/$/, '').replace(/^http/i, 'ws')
  : '';

export const AR_WS_URL = normalizedArWs || `${AR_WS_PROTOCOL}://${AR_HOST}:8000/ws/camera`;

export { AR_BASE_URL };

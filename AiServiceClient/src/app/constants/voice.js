const RAW_WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || '';
const WS_BASE_URL = RAW_WS_BASE_URL &&
  !RAW_WS_BASE_URL.includes('localhost') &&
  !RAW_WS_BASE_URL.includes('127.0.0.1')
  ? RAW_WS_BASE_URL.replace(/\/$/, '')
  : '';
const normalizedBase = WS_BASE_URL ? WS_BASE_URL.replace(/^http/i, 'ws') : '';
const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:'
  ? 'wss'
  : 'ws';
const wsHost = typeof window !== 'undefined' ? window.location.host : 'localhost';

export const VOICE_WS_URL = normalizedBase || `${wsProtocol}://${wsHost}/ws`;

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL = RAW_API_BASE_URL &&
	!RAW_API_BASE_URL.includes('localhost') &&
	!RAW_API_BASE_URL.includes('127.0.0.1')
	? RAW_API_BASE_URL.replace(/\/$/, '')
	: '';

export const CHAT_API_URL = API_BASE_URL ? `${API_BASE_URL}/api/chat` : '/api/chat';

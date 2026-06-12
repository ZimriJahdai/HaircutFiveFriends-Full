const API_URL = import.meta.env.VITE_API_URL; // http://localhost:3006/haircutFiveFriends/api/v1

const authHeader = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

// ── ADMIN ────────────────────────────────────────────────────────────────────

export const fetchAppointmentsByDate = async (token, date) => {
  const res = await fetch(`${API_URL}/appointments/date/${date}`, {
    headers: authHeader(token),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json; // { total, data }
};

export const fetchAllAppointments = async (token) => {
  const res = await fetch(`${API_URL}/appointments`, {
    headers: authHeader(token),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json; // { total, data }
};

export const fetchClients = async (token) => {
  const res = await fetch(`${API_URL}/clients`, {
    headers: authHeader(token),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json; // { data: [...] }
};

export const fetchBarbers = async (token) => {
  const res = await fetch(`${API_URL}/barbers`, {
    headers: authHeader(token),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json; // { data: [...] }
};

export const fetchSales = async (token) => {
  const res = await fetch(`${API_URL}/sales`, {
    headers: authHeader(token),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json; // { sales: [...] }
};

// ── USER ─────────────────────────────────────────────────────────────────────

export const fetchAppointmentsByClient = async (token, clientId) => {
  const res = await fetch(`${API_URL}/appointments/client/${clientId}`, {
    headers: authHeader(token),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json; // { total, data }
};

export const fetchClientPoints = async (token, clientId) => {
  const res = await fetch(`${API_URL}/clients/${clientId}/points`, {
    headers: authHeader(token),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json; // { data: { clientId, name, points } }
};

export const fetchClientById = async (token, clientId) => {
  const res = await fetch(`${API_URL}/clients/${clientId}`, {
    headers: authHeader(token),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json; // { data: { ...client } }
};

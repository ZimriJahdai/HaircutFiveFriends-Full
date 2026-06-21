import { axiosAdmin } from './api.js';

const BASE = '/appointments';

// Admin / Employee
export const getAppointments          = ()            => axiosAdmin.get(`${BASE}/`).then(r => r.data);
export const getAppointmentById       = (id)          => axiosAdmin.get(`${BASE}/${id}`).then(r => r.data);
export const getAppointmentsByDate    = (date)        => axiosAdmin.get(`${BASE}/date/${date}`).then(r => r.data);
export const getAppointmentsByBarber  = (barberId)    => axiosAdmin.get(`${BASE}/barber/${barberId}`).then(r => r.data);
export const getAppointmentsByClient  = (clientId)    => axiosAdmin.get(`${BASE}/client/${clientId}`).then(r => r.data);

// Cliente autenticado (resuelto por token en el backend)
export const getMyAppointments        = ()            => axiosAdmin.get(`${BASE}/mine`).then(r => r.data);

// Mutaciones
export const createAppointment        = (data)        => axiosAdmin.post(`${BASE}/create`, data).then(r => r.data);
export const updateAppointment        = (id, data)    => axiosAdmin.put(`${BASE}/${id}`, data).then(r => r.data);
export const cancelAppointment        = (id)          => axiosAdmin.delete(`${BASE}/${id}`).then(r => r.data);

import { useEffect, useState } from 'react';
import { getAllServices } from '../../../shared/api/service.js';
import { getBarbers } from '../../../shared/api/barber.js';
import { getClients } from '../../../shared/api/client.js';

// Carga los catálogos necesarios para el formulario de cita.
// `withClients` evita pedir la lista de clientes cuando es un cliente reservando.
export const useAppointmentResources = ({ withClients = true } = {}) => {
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const requests = [getAllServices(), getBarbers()];
        if (withClients) requests.push(getClients());
        const [servicesRes, barbersRes, clientsRes] = await Promise.all(requests);
        if (!active) return;
        setServices(servicesRes.data || []);
        setBarbers(barbersRes.data?.data || []);
        if (withClients) setClients(clientsRes.data?.data || []);
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Error al cargar catálogos');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [withClients]);

  return { services, barbers, clients, loading, error };
};

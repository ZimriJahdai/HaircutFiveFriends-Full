// Constantes de dominio. Los literales son case-sensitive y deben coincidir
// exactamente con lo que espera HaircutFiveFriends (backend).

export { SPACING, FONT_SIZE, RADIUS, SHADOWS } from './theme';
export { ENDPOINTS } from './endpoints';

// --- Roles ---
export const ROLES = {
  ADMIN: 'ADMIN_ROLE',
  USER: 'USER_ROLE',
  EMPLOYEE: 'EMPLOYEE_ROLE',
};

// --- Tipos de favorito ---
export const FAVORITE_TYPES = {
  BARBER: 'BARBER',
  SERVICE: 'SERVICE',
  PRODUCT: 'PRODUCT',
  HAIRCUT: 'HAIRCUT',
};

export const FAVORITE_TYPE_OPTIONS = [
  { value: FAVORITE_TYPES.BARBER, label: 'Barberos' },
  { value: FAVORITE_TYPES.SERVICE, label: 'Servicios' },
  { value: FAVORITE_TYPES.PRODUCT, label: 'Productos' },
  { value: FAVORITE_TYPES.HAIRCUT, label: 'Cortes' },
];

// --- Tipos de detalle de venta ---
export const SALE_DETAIL_TYPES = {
  SERVICE: 'SERVICE',
  PRODUCT: 'PRODUCT',
};

// --- Estados de cita ---
export const APPOINTMENT_STATUS = {
  PENDIENTE: 'PENDIENTE',
  CANCELADA: 'CANCELADA',
  COMPLETADA: 'COMPLETADA',
};

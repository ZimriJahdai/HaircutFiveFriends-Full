import { withErrorBoundary } from '../shared/components';

import { HomeScreen } from '../features/client/screens/HomeScreen';
import { PerfilScreen } from '../features/client/screens/PerfilScreen';
import { BarberosScreen } from '../features/barbers/screens/BarberosScreen';
import { ServiciosScreen } from '../features/services/screens/ServiciosScreen';
import { ProductosScreen } from '../features/products/screens/ProductosScreen';
import { ReservarCitaScreen } from '../features/appointments/screens/ReservarCitaScreen';
import { MisCitasScreen } from '../features/appointments/screens/MisCitasScreen';
import { FavoritosScreen } from '../features/favorites/screens/FavoritosScreen';
import { FacturasScreen } from '../features/invoices/screens/FacturasScreen';
import { ReseñasScreen } from '../features/reviews/screens/ReseñasScreen';

// Cada pantalla del área autenticada se envuelve una sola vez aquí en un
// ErrorBoundary: un error de render no deja la app en blanco.
export const S = {
  Home: withErrorBoundary(HomeScreen),
  Perfil: withErrorBoundary(PerfilScreen),
  Barberos: withErrorBoundary(BarberosScreen),
  Servicios: withErrorBoundary(ServiciosScreen),
  Productos: withErrorBoundary(ProductosScreen),
  ReservarCita: withErrorBoundary(ReservarCitaScreen),
  MisCitas: withErrorBoundary(MisCitasScreen),
  Favoritos: withErrorBoundary(FavoritosScreen),
  Facturas: withErrorBoundary(FacturasScreen),
  Reseñas: withErrorBoundary(ReseñasScreen),
};

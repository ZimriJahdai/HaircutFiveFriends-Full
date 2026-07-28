import { withErrorBoundary } from '../shared/components';

import { HomeScreen } from '../features/client/screens/HomeScreen';
import { PerfilScreen } from '../features/client/screens/PerfilScreen';
import { BarberosScreen } from '../features/barbers/screens/BarberosScreen';
import { ServiciosScreen } from '../features/services/screens/ServiciosScreen';
import { ProductosScreen } from '../features/products/screens/ProductosScreen';
import { IAScreen } from '../features/ai/screens/IAScreen';
import { ReservarCitaScreen } from '../features/appointments/screens/ReservarCitaScreen';
import { MisCitasScreen } from '../features/appointments/screens/MisCitasScreen';
import { FavoritosScreen } from '../features/favorites/screens/FavoritosScreen';
import { FacturasScreen } from '../features/invoices/screens/FacturasScreen';
import { MisComprasScreen } from '../features/sales/screens/MisComprasScreen';
import { CartScreen } from '../features/cart/components/CartScreen';
import { ReseñasScreen } from '../features/reviews/screens/ReseñasScreen';
import { ProbarCorteScreen } from '../features/ai/screens/ProbarCorteScreen';
import { GaleriaScreen } from '../features/haircut/screens/GaleriaScreen';
import { ReportesScreen } from '../features/statistics/screens/ReportesScreen';

// Cada pantalla del área autenticada se envuelve una sola vez aquí en un
// ErrorBoundary: un error de render no deja la app en blanco.
export const S = {
  Home: withErrorBoundary(HomeScreen),
  Perfil: withErrorBoundary(PerfilScreen),
  Barberos: withErrorBoundary(BarberosScreen),
  Servicios: withErrorBoundary(ServiciosScreen),
  Productos: withErrorBoundary(ProductosScreen),
  Carrito: withErrorBoundary(CartScreen),
  ReservarCita: withErrorBoundary(ReservarCitaScreen),
  MisCitas: withErrorBoundary(MisCitasScreen),
  Favoritos: withErrorBoundary(FavoritosScreen),
  MisCompras: withErrorBoundary(MisComprasScreen),
  Facturas: withErrorBoundary(FacturasScreen),
  Reportes: withErrorBoundary(ReportesScreen),
  Reseñas: withErrorBoundary(ReseñasScreen),
  ProbarCorte: withErrorBoundary(ProbarCorteScreen),
  Galeria: withErrorBoundary(GaleriaScreen),
};

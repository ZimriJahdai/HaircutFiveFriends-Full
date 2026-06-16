import { Routes, Route } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx';
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { RoleGuard } from './RoleGuard.jsx';
import DashboardLayout from '../../shared/components/layout/DashboardLayout.jsx';
import DashboardHome from '../../app/pages/DashboardHome.jsx';
import { Haircut } from '../../features/haircut/pages/Haircut.jsx';
import { Barber } from '../../features/barber-admin/pages/Barber.jsx';
import { Client } from '../../features/client-admin/pages/Client.jsx';
import { ClientHome } from '../pages/ClientHome.jsx';
import { Home } from '../../features/client/pages/Home.jsx';
import { Barberos } from '../../features/barber-client/pages/Barberos.jsx';
import { Favoritos } from '../../features/favorites/pages/Favoritos.jsx';
import { Perfil } from '../../features/client/pages/Perfil.jsx';


// Componentes unificados (admin + cliente en uno solo)
import { Services } from '../../features/services/pages/Services.jsx';
import { Reviews } from '../../features/reviews/pages/Reviews.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Rutas admin */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['ADMIN_ROLE']}>
              <DashboardLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="haircut" element={<Haircut />} />
        <Route path="barberos" element={<Barber />} />
        <Route path="servicios" element={<Services />} />   {/* ← unificado */}
        <Route path="resenas" element={<Reviews />} />       {/* ← unificado */}
        <Route path="clientes" element={<Client />} />
      </Route>

      {/* Rutas cliente */}
      <Route
        path="/client"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['USER_ROLE']}>
              <ClientHome />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="barberos" element={<Barberos />} />
        <Route path="servicios" element={<Services />} />   {/* ← unificado */}
        <Route path="resenas" element={<Reviews />} />       {/* ← unificado */}
        <Route path="favoritos" element={<Favoritos />} />
        <Route path="perfil" element={<Perfil />} />

      </Route>
    </Routes>
  );
};

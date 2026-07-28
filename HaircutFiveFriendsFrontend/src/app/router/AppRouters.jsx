import { Routes, Route } from 'react-router-dom';

import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx';
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage.jsx';
import WelcomePage from '../pages/WelcomePage.jsx';

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

import { ProductsAdmin } from '../../features/products/pages/ProductsAdmin.jsx';
import { ProductsClient } from '../../features/products/pages/ProductsClient.jsx';
import { ProbarCorte } from '../../features/ar-tryon/pages/ProbarCorte.jsx';
import Galeria from '../../features/client/pages/Galeria.jsx';
import { AIDashboardPage } from '../../features/ai-suite/pages/AIDashboardPage.jsx';
import { AIChatPage } from '../../features/ai-suite/pages/AIChatPage.jsx';
import { AIVoicePage } from '../../features/ai-suite/pages/AIVoicePage.jsx';
import { AIReviewsInsightsPage } from '../../features/ai-suite/pages/AIReviewsInsightsPage.jsx';

import { ServicesAdmin } from '../../features/services/pages/ServicesAdmin.jsx';
import { ServicesClient } from '../../features/services/pages/ServicesClient.jsx';
import { ReviewsAdmin } from '../../features/reviews/pages/ReviewsAdmin.jsx';
import { ReviewsClient } from '../../features/reviews/pages/ReviewsClient.jsx';
import { InvoicesAdmin } from '../../features/invoice/pages/InvoicesAdmin.jsx';
import { InvoicesClient } from '../../features/invoice/pages/InvoicesClient.jsx';
import { SalesAdmin } from '../../features/sales/pages/SalesAdmin.jsx';
import { SalesClient } from '../../features/sales/pages/SalesClient.jsx';
import { ReportsAdmin } from '../../features/statistics/pages/ReportsAdmin.jsx';
import { ReportsClient } from '../../features/statistics/pages/ReportsClient.jsx';

import { AppointmentsAdmin } from '../../features/appointments/pages/AppointmentsAdmin.jsx';
import { AppointmentsClient } from '../../features/appointments/pages/AppointmentsClient.jsx';
import { ReservarCita } from '../../features/appointments/pages/ReservarCita.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* =========================
          RUTAS ADMIN
      ========================== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['ADMIN_ROLE', 'EMPLOYEE_ROLE']}>
              <DashboardLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="haircut" element={<Haircut />} />
        <Route path="barberos" element={<Barber />} />
        <Route path="servicios" element={<ServicesAdmin />} />
        <Route path="productos" element={<ProductsAdmin />} />
        <Route path="facturas" element={<InvoicesAdmin />} />
        <Route path="resenas" element={<ReviewsAdmin />} />
        <Route path="ventas" element={<SalesAdmin />} />
        <Route path="reportes" element={<ReportsAdmin />} />
        <Route path="citas" element={<AppointmentsAdmin />} />
        <Route path="clientes" element={<Client />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      {/* =========================
          RUTAS CLIENTE
      ========================== */}
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
        <Route path="servicios" element={<ServicesClient />} />
        <Route path="productos" element={<ProductsClient />} />
        <Route path="facturas" element={<InvoicesClient />} />
        <Route path="resenas" element={<ReviewsClient />} />
        <Route path="favoritos" element={<Favoritos />} />
        <Route path="compras" element={<SalesClient />} />
        <Route path="reportes" element={<ReportsClient />} />
        <Route path="probar-corte" element={<ProbarCorte />} />
        <Route path="ia" element={<AIDashboardPage />} />
        <Route path="ia/chat" element={<AIChatPage />} />
        <Route path="ia/voz" element={<AIVoicePage />} />
        <Route path="ia/resenas" element={<AIReviewsInsightsPage />} />
        <Route path="galeria" element={<Galeria />} />
        <Route path="reservar" element={<ReservarCita />} />
        <Route path="citas" element={<AppointmentsClient />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
    </Routes>
  );
};
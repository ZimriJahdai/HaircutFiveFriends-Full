import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx';
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage.jsx';
import AdminRestaurantePage from '../pages/AdminRestaurantePage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { RoleGuard } from './RoleGuard.jsx';
import DashboardLayout from '../../shared/components/layout/DashboardLayout.jsx';
import DashboardHome from '../../app/pages/DashboardHome.jsx';
import { Haircut } from '../../features/haircut/components/Haircut.jsx';
import { ClientHome } from '../pages/ClientHome.jsx';
import { Home } from '../../features/client/pages/Home.jsx';

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
        <Route path='haircut' element={<Haircut />} />
        {/* Aquí irán tus páginas admin: citas, clientes, etc. */}
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
      </Route>

      <Route
        path="/admin-restaurante"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['ADMIN_RESTAURANTE', 'ADMIN_RESTAURANT']}>
              <AdminRestaurantePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.jsx';
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage.jsx';
import DashboardHome from '../pages/DashboardHome.jsx';
import AdminRestaurantePage from '../pages/AdminRestaurantePage.jsx';
import ClientHome from '../pages/ClientHome.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { RoleGuard } from './RoleGuard.jsx';
import DashboardLayout from '../../shared/components/layout/DashboardLayout.jsx'; // 👈 agregar
import { Haircut } from '../../features/haircut/components/Haircut.jsx';

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
              <DashboardLayout />
            </RoleGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientHome />} />
        {/* Aquí irán tus páginas cliente: reservar, citas, perfil, etc. */}
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
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


// Componentes unificados
import { Services } from '../../features/services/pages/Services.jsx';

import { ReviewAdmin } from '../../features/review-admin/pages/ReviewAdmin.jsx';
import { ReviewClient } from '../../features/review-client/pages/ReviewClient.jsx';



export const AppRoutes = () => {

  return (

    <Routes>


      {/* Públicas */}

      <Route 
        path="/" 
        element={<AuthPage />} 
      />


      <Route 
        path="/auth" 
        element={<AuthPage />} 
      />


      <Route 
        path="/verify-email" 
        element={<VerifyEmailPage />} 
      />


      <Route 
        path="/reset-password" 
        element={<ResetPasswordPage />} 
      />


      <Route 
        path="/unauthorized" 
        element={<UnauthorizedPage />} 
      />




      {/* =========================
          RUTAS ADMIN
      ========================== */}


      <Route

        path="/dashboard"

        element={

          <ProtectedRoute>

            <RoleGuard 
              allowedRoles={[
                'ADMIN_ROLE'
              ]}
            >

              <DashboardLayout />

            </RoleGuard>

          </ProtectedRoute>

        }

      >



        <Route 
          index 
          element={<DashboardHome />} 
        />



        <Route 
          path="haircut" 
          element={<Haircut />} 
        />



        <Route 
          path="barberos" 
          element={<Barber />} 
        />



        <Route 
          path="servicios" 
          element={<Services />} 
        />



        <Route 
          path="resenas" 
          element={<ReviewAdmin />} 
        />



        <Route 
          path="clientes" 
          element={<Client />} 
        />


      </Route>






      {/* =========================
          RUTAS CLIENTE
      ========================== */}



      <Route

        path="/client"

        element={

          <ProtectedRoute>


            <RoleGuard

              allowedRoles={[
                'USER_ROLE'
              ]}

            >


              <ClientHome />


            </RoleGuard>


          </ProtectedRoute>


        }

      >




        <Route 
          index 
          element={<Home />} 
        />



        <Route 
          path="barberos" 
          element={<Barberos />} 
        />



        <Route 
          path="servicios" 
          element={<Services />} 
        />



        <Route 
          path="resenas" 
          element={<ReviewClient />} 
        />



        <Route 
          path="favoritos" 
          element={<Favoritos />} 
        />



      </Route>



    </Routes>

  );

};
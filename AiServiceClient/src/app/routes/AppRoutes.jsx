import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../layouts/AppShell.jsx';
import ChatPage from '../pages/ChatPage.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NotFound from '../pages/NotFound.jsx';
import ReviewsPage from '../pages/ReviewsPage.jsx';
import VisionPage from '../pages/VisionPage.jsx';
import VoicePage from '../pages/VoicePage.jsx';
import { getAuth } from '../utils/authStorage.js';

const RequireAuth = ({ children }) => {
  const auth = getAuth();
  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RedirectIfAuth = ({ children }) => {
  const auth = getAuth();
  if (auth?.token) {
    return <Navigate to="/chat" replace />;
  }
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        element={(
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        )}
      >
        <Route index element={<Dashboard />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="voice" element={<VoicePage />} />
        <Route path="vision" element={<VisionPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
      </Route>
      <Route
        path="login"
        element={(
          <RedirectIfAuth>
            <LoginPage />
          </RedirectIfAuth>
        )}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
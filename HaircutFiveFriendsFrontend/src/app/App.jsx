import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './router/AppRouters.jsx';

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" />
    </>
  );
}

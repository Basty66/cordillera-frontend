import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Ventas from './pages/Ventas';
import Productos from './pages/Productos';
import Sucursales from './pages/Sucursales';
import Empleados from './pages/Empleados';
import Indicadores from './pages/Indicadores';
import Tickets from './pages/Tickets';
import Reportes from './pages/Reportes';
import Profile from './pages/Profile';
import AdminUsuarios from './pages/admin/AdminUsuarios';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!splashDone) return <SplashScreen onFinish={() => setSplashDone(true)} />;

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="ventas" element={<Ventas />} />
                <Route path="productos" element={<Productos />} />
                <Route path="sucursales" element={<Sucursales />} />
                <Route path="empleados" element={<Empleados />} />
                <Route path="indicadores" element={<Indicadores />} />
                <Route path="tickets" element={<Tickets />} />
                <Route path="reportes" element={<Reportes />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin/usuarios" element={
                  <ProtectedRoute roles={['ADMIN']}><AdminUsuarios /></ProtectedRoute>
                } />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

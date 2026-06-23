import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.rol)) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center h-full min-h-[50vh]"
      >
        <div className="text-center glass-card-neon rounded-2xl p-10 max-w-sm">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex p-4 bg-red-100 rounded-2xl mb-4"
          >
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </motion.div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Denegado</h2>
          <p className="text-sm text-slate-500">No tienes permisos para ver esta pagina</p>
          <div className="mt-4 text-[10px] text-slate-400 uppercase tracking-wider">
            Rol requerido: {roles?.join(', ')}
          </div>
        </div>
      </motion.div>
    );
  }

  return children || <Outlet />;
}

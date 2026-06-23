import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, LayoutDashboard } from 'lucide-react';

const labelMap = {
  '': 'Dashboard',
  ventas: 'Ventas',
  productos: 'Productos',
  sucursales: 'Sucursales',
  empleados: 'Empleados',
  indicadores: 'Indicadores',
  tickets: 'Tickets',
  reportes: 'Reportes',
  admin: 'Administración',
  usuarios: 'Usuarios',
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
        <LayoutDashboard className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Inicio</span>
      </Link>
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/');
        const label = labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3" />
            {isLast ? (
              <span className="text-slate-600 dark:text-slate-300 font-medium">{label}</span>
            ) : (
              <Link to={path} className="hover:text-emerald-600 transition-colors">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

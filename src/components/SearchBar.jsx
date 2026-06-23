import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, ShoppingCart, Package, Store, Users, BarChart3, TicketCheck, FileText, Shield, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, keywords: 'inicio home principal' },
  { to: '/ventas', label: 'Ventas', icon: ShoppingCart, keywords: 'transacciones facturas' },
  { to: '/productos', label: 'Productos', icon: Package, keywords: 'articulos inventario stock' },
  { to: '/sucursales', label: 'Sucursales', icon: Store, keywords: 'tiendas ubicaciones locales' },
  { to: '/empleados', label: 'Empleados', icon: Users, keywords: 'trabajadores personal' },
  { to: '/indicadores', label: 'Indicadores', icon: BarChart3, keywords: 'kpi metricas rendimiento' },
  { to: '/tickets', label: 'Tickets', icon: TicketCheck, keywords: 'soporte incidencias' },
  { to: '/reportes', label: 'Reportes', icon: FileText, keywords: 'exportar informes' },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Shield, keywords: 'admin cuentas roles', admin: true },
];

export default function SearchBar({ isAdmin }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const navigate = useNavigate();

  const filtered = items
    .filter(i => !i.admin || isAdmin)
    .filter(i =>
      i.label.toLowerCase().includes(query.toLowerCase()) ||
      i.keywords.toLowerCase().includes(query.toLowerCase())
    );

  const handleSelect = useCallback((to) => {
    setOpen(false);
    setQuery('');
    navigate(to);
  }, [navigate]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
        return;
      }
      if (e.key === 'Escape') { setOpen(false); return; }
      if (!open) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && filtered[selectedIdx]) { e.preventDefault(); handleSelect(filtered[selectedIdx].to); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, selectedIdx, handleSelect]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        document.getElementById('cmd-search')?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all w-full sm:w-auto"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Buscar...</span>
        <span className="hidden sm:flex items-center gap-1 ml-4 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] text-slate-500">
          <Command className="w-2.5 h-2.5" />K
        </span>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 cmd-overlay flex items-start justify-center pt-[15vh] px-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  id="cmd-search"
                  type="text"
                  placeholder="Buscar páginas..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none cmd-input"
                  autoComplete="off"
                />
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-400 font-mono">ESC</kbd>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8">Sin resultados</p>
                ) : filtered.map((item, i) => (
                  <motion.button
                    key={item.to}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleSelect(item.to)}
                    onMouseEnter={() => setSelectedIdx(i)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all group ${
                      i === selectedIdx ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${i === selectedIdx ? 'text-emerald-500' : 'text-slate-400'} transition-colors`} />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </div>
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 flex items-center gap-3">
                  <span><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">↑↓</kbd> Navegar</span>
                  <span><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">↵</kbd> Abrir</span>
                  <span><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">ESC</kbd> Cerrar</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

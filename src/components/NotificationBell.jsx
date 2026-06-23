import { useState } from 'react';
import { Bell, TicketCheck, AlertCircle, ShoppingCart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const notifications = [
  { id: 1, icon: TicketCheck, text: 'Nuevo ticket creado por vendedor', time: 'Hace 5m', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  { id: 2, icon: ShoppingCart, text: 'Venta registrada en Sucursal Centro', time: 'Hace 1h', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { id: 3, icon: AlertCircle, text: 'Stock bajo: Notebooks (3 unidades)', time: 'Hace 2h', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread] = useState(notifications.length);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
            {unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-40"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notificaciones</h3>
                <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Marcar todas leídas</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8">Sin notificaciones</p>
                ) : notifications.map(n => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div className={`p-1.5 rounded-lg ${n.bg} shrink-0`}>
                      <n.icon className={`w-4 h-4 ${n.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{n.text}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

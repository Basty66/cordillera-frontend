import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const { hasRole } = useAuth();
  const [mobileSidebar, setMobileSidebar] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] relative noise">
      {/* Ambient floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-1 animate-float-slow" style={{animationDelay: '0s'}} />
        <div className="orb orb-2 animate-float-slow" style={{animationDelay: '-3s'}} />
        <div className="orb orb-3 animate-float-slow" style={{animationDelay: '-6s'}} />
        <div className="orb orb-4 animate-float" style={{animationDelay: '-2s'}} />
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 h-full ${
        mobileSidebar ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar onClose={() => setMobileSidebar(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto relative">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[var(--bg-primary)]/70 backdrop-blur-2xl border-b border-[var(--border-color)]">
          <div className="divider-gradient absolute bottom-0 left-0 right-0" />
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebar(true)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-200 active:scale-95 lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>
              <SearchBar isAdmin={hasRole('ADMIN')} />
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto relative">
          <Breadcrumbs />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function DetailModal({ open, onClose, children, title, size = 'max-w-lg' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            className={`glass-card-neon rounded-2xl shadow-2xl w-full ${size} max-h-[90vh] overflow-y-auto`}
            onClick={e => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between p-5 pb-3 border-b border-emerald-500/10">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </motion.button>
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Sparkles } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
  return (
    <AnimatePresence>
      <motion.div
        className="splash-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.03 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        onAnimationComplete={() => { setTimeout(onFinish, 150); }}
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/8 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/4 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,.2) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

        <motion.div className="splash-content relative" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
          <div className="splash-logo">
            <div className="splash-logo-ring" />
            <motion.div className="absolute inset-0 rounded-full" animate={{ boxShadow: ['0 0 10px rgba(16,185,129,0.2)', '0 0 40px rgba(16,185,129,0.4)', '0 0 10px rgba(16,185,129,0.2)'] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
            <div className="splash-logo-inner">
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <BarChart3 className="w-8 h-8 text-emerald-400" />
              </motion.div>
            </div>
            <motion.div className="absolute -top-1 -right-1" animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </motion.div>
          </div>

          <motion.h1 className="text-3xl font-bold text-white mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
            Grupo Cordillera
          </motion.h1>

          <motion.p className="text-emerald-400/70 text-sm mb-8 tracking-wide neon-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
            Plataforma de Monitoreo Inteligente
          </motion.p>

          <motion.div className="splash-dots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <span /><span /><span />
          </motion.div>

          <motion.p className="text-slate-600 text-[10px] mt-6 uppercase tracking-[0.3em] font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            Inicializando...
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

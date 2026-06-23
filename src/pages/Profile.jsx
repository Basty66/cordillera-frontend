import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Lock, Save, CheckCircle, AtSign, AlertCircle, Loader } from 'lucide-react';
import { updateProfile, changePassword } from '../api/client';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemAnim = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const roleMeta = {
  ADMIN: { label: 'Administrador', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/10' },
  VENDEDOR: { label: 'Vendedor', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/10' },
  BODEGA: { label: 'Bodega', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/10' },
};

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ nombre: user?.nombre || '', email: user?.email || '' });
  const [pw, setPw] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [pwError, setPwError] = useState('');

  const rm = roleMeta[user?.rol] || { label: 'Usuario', color: 'from-slate-500 to-slate-600', bg: 'bg-slate-100' };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaving(true);
    try {
      await updateProfile({ nombre: form.nombre, email: form.email });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handlePw = async (e) => {
    e.preventDefault();
    setPwError('');
    if (!pw.current.trim()) { setPwError('Ingresa tu contraseña actual'); return; }
    if (!pw.new.trim()) { setPwError('Ingresa una nueva contraseña'); return; }
    if (pw.new.length < 6) { setPwError('Mínimo 6 caracteres'); return; }
    if (pw.new !== pw.confirm) { setPwError('Las contraseñas no coinciden'); return; }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pw.current, newPassword: pw.new });
      setPwSaved(true);
      setPw({ current: '', new: '', confirm: '' });
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError(err.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-6">
      <motion.div variants={itemAnim} className="flex items-center gap-3 mb-2">
        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Mi Perfil</h2>
          <p className="text-sm text-[var(--text-secondary)]">Configuración de tu cuenta</p>
        </div>
      </motion.div>

      <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative">
            <div className={`w-20 h-20 bg-gradient-to-br ${rm.color} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl`}>
              {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{user?.nombre}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{user?.email || user?.username}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2 justify-center sm:justify-start">
              <span className={`text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r ${rm.color} text-white shadow-lg`}>
                {rm.label}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <AtSign className="w-3 h-3" /> @{user?.username}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-[var(--text-primary)]">Información Personal</h3>
          </div>
          <form onSubmit={handleSave} className="space-y-3">
            {saveError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg border border-red-200 dark:border-red-500/20">
                <AlertCircle className="w-3.5 h-3.5" />{saveError}
              </motion.div>
            )}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Nombre</label>
              <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--input-border)] rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500 input-neon" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--input-border)] rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500 input-neon" />
            </div>
            <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50">
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar Cambios
            </motion.button>
            {saved && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Cambios guardados
              </motion.p>
            )}
          </form>
        </motion.div>

        <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-[var(--text-primary)]">Cambiar Contraseña</h3>
          </div>
          {pwError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg mb-3 border border-red-200 dark:border-red-500/20">
              <AlertCircle className="w-3.5 h-3.5" />{pwError}
            </motion.div>
          )}
          <form onSubmit={handlePw} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Contraseña Actual</label>
              <input type="password" value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--input-border)] rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500 input-neon" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Nueva Contraseña</label>
              <input type="password" value={pw.new} onChange={e => setPw({ ...pw, new: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--input-border)] rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500 input-neon" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Confirmar Nueva</label>
              <input type="password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--input-border)] rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500 input-neon" />
            </div>
            <motion.button type="submit" disabled={pwSaving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50">
              {pwSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Actualizar Contraseña
            </motion.button>
            {pwSaved && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Contraseña actualizada
              </motion.p>
            )}
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}

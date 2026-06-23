import { useEffect, useState, useRef } from 'react';
import { getTickets, createTicket, updateTicketStatus, deleteTicket, getTicketAnalytics, clasificarTicket } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TicketCheck, Plus, X, AlertCircle, CheckCircle, Clock, Loader, Trash2, MessageSquare,
  BarChart3, Target, Zap, HelpCircle, DollarSign, Brain, RefreshCw,
  ChevronDown, Search
} from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.035 } } };
const itemAnim = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } } };

const statusConfig = {
  ABIERTO: { label: 'Abierto', color: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25', dot: 'bg-blue-500', icon: AlertCircle },
  EN_PROGRESO: { label: 'En Progreso', color: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25', dot: 'bg-amber-500', icon: Loader },
  RESUELTO: { label: 'Resuelto', color: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25', dot: 'bg-emerald-500', icon: CheckCircle },
  CERRADO: { label: 'Cerrado', color: 'bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600/30', dot: 'bg-slate-400', icon: X },
};

const prioridadConfig = {
  CRITICA: { label: 'Crítica', dot: 'bg-red-500', color: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/25', border: 'border-l-red-500' },
  ALTA: { label: 'Alta', dot: 'bg-orange-500', color: 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/25', border: 'border-l-orange-500' },
  MEDIA: { label: 'Media', dot: 'bg-blue-500', color: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25', border: 'border-l-blue-500' },
  BAJA: { label: 'Baja', dot: 'bg-slate-400', color: 'bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600/30', border: 'border-l-slate-400' },
};

const categoryConfig = {
  TÉCNICO: { label: 'Técnico', color: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/25', icon: Zap },
  FACTURACIÓN: { label: 'Facturación', color: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25', icon: DollarSign },
  RECLAMO: { label: 'Reclamo', color: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/25', icon: AlertCircle },
  CONSULTA: { label: 'Consulta', color: 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/25', icon: HelpCircle },
};

const statusFlow = ['ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO'];

const CustomAnalyticsTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 px-3 py-2">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
  return null;
};

export default function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('TODOS');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('listar');
  const [form, setForm] = useState({ titulo: '', descripcion: '', prioridad: 'MEDIA' });
  const [formErrors, setFormErrors] = useState({});
  const [categoriaSugerida, setCategoriaSugerida] = useState(null);
  const [clasificando, setClasificando] = useState(false);
  const [toast, setToast] = useState(null);

  const validateForm = () => {
    const errs = {};
    if (!form.titulo.trim()) errs.titulo = 'El título es requerido';
    else if (form.titulo.trim().length < 5) errs.titulo = 'Mínimo 5 caracteres';
    else if (form.titulo.trim().length > 200) errs.titulo = 'Máximo 200 caracteres';
    if (form.descripcion && form.descripcion.length > 2000) errs.descripcion = 'Máximo 2000 caracteres';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const toastRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => { setToast(null); toastRef.current = null; }, 3000);
  };

  useEffect(() => { return () => { if (toastRef.current) clearTimeout(toastRef.current); }; }, []);

  const load = async () => {
    try { setLoading(true); const [data, an] = await Promise.all([getTickets(), getTicketAnalytics()]); setTickets(data); setAnalytics(an); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAutoClasificar = async () => {
    if (!form.titulo.trim()) return;
    setClasificando(true);
    try { const res = await clasificarTicket(form.titulo, form.descripcion); setCategoriaSugerida(res.categoria); }
    catch { setCategoriaSugerida('CONSULTA'); }
    finally { setClasificando(false); }
  };

  useEffect(() => {
    if (showModal) { setCategoriaSugerida(null); setForm({ titulo: '', descripcion: '', prioridad: 'MEDIA' }); setFormErrors({}); }
  }, [showModal]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await createTicket({ ...form, titulo: form.titulo.trim(), descripcion: form.descripcion.trim(), creadoPor: user?.username });
      showToast('Ticket creado exitosamente'); setShowModal(false); load();
    } catch (e) { showToast(e.response?.data?.error || 'Error al crear ticket', 'error'); }
  };

  const handleStatus = async (id, status) => {
    try { await updateTicketStatus(id, status); showToast(`Ticket marcado como ${statusConfig[status]?.label}`); load(); }
    catch { showToast('Error al actualizar', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este ticket?')) return;
    try { await deleteTicket(id); showToast('Ticket eliminado'); load(); }
    catch { showToast('Error al eliminar', 'error'); }
  };

  const filtered = (filter === 'TODOS' ? tickets : tickets.filter(t => t.status === filter))
    .filter(t => !search || t.titulo.toLowerCase().includes(search.toLowerCase()) || t.descripcion?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: tickets.length, abiertos: tickets.filter(t => t.status === 'ABIERTO').length,
    enProgreso: tickets.filter(t => t.status === 'EN_PROGRESO').length, resueltos: tickets.filter(t => t.status === 'RESUELTO').length,
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -40, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -40, x: '-50%' }}
            className="fixed top-4 left-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold backdrop-blur-xl"
            style={{ background: toast.type === 'error' ? 'rgba(220,38,38,0.9)' : 'rgba(16,185,129,0.9)' }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg shadow-violet-500/20">
            <TicketCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Tickets</h2>
            <p className="text-xs text-slate-400">Sistema de seguimiento con clasificación inteligente</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={load} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all whitespace-nowrap">
            <RefreshCw className="w-3.5 h-3.5" /> Actualizar
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-violet-600/20 whitespace-nowrap">
            <Plus className="w-3.5 h-3.5" /> Nuevo Ticket
          </motion.button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit">
        {[
          { id: 'listar', label: 'Listado', icon: TicketCheck },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map(t => (
          <motion.button key={t.id} whileTap={{ scale: 0.97 }} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </motion.button>
        ))}
      </div>

      {tab === 'analytics' ? (
        <motion.div variants={container} initial="hidden" animate="show">
          {analytics ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Total', value: analytics.totalTickets, color: 'from-slate-500 to-slate-600', icon: TicketCheck },
                  { label: 'Abiertos', value: analytics.abiertos, color: 'from-blue-500 to-blue-600', icon: AlertCircle },
                  { label: 'En Progreso', value: analytics.enProgreso, color: 'from-amber-500 to-amber-600', icon: Clock },
                  { label: 'Críticos Abiertos', value: analytics.criticosAbiertos, color: 'from-red-500 to-red-600', icon: Zap },
                ].map(s => (
                  <motion.div key={s.label} variants={itemAnim} whileHover={{ y: -3 }} className="glass-card-neon rounded-xl p-4 text-center relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${s.color} opacity-[0.04] rounded-full -translate-y-8 translate-x-8`} />
                    <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{s.value}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium uppercase tracking-wide">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-violet-500" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Clasificación Inteligente</h3>
                    <span className="ml-auto text-[9px] font-mono text-slate-400">IA por palabras clave</span>
                  </div>
                  {analytics.porCategoria && Object.keys(analytics.porCategoria).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(analytics.porCategoria).map(([cat, count], i) => {
                        const cfg = categoryConfig[cat] || { label: cat, color: 'bg-slate-100 text-slate-600 border-slate-200', icon: HelpCircle };
                        const total = analytics.totalTickets || 1;
                        const pct = ((count / total) * 100).toFixed(0);
                        const CatIcon = cfg.icon;
                        return (
                          <div key={cat}>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded-lg ${cfg.color}`}><CatIcon className="w-3 h-3" /></div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{cfg.label}</span>
                              </div>
                              <span className="text-slate-400 font-mono">{count} ({pct}%)</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: pct + '%' }} transition={{ duration: 0.8, delay: i * 0.08 }}
                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">Sin datos de clasificación</p>
                  )}
                </motion.div>

                <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Métricas de Resolución</h3>
                    <span className="ml-auto text-[9px] font-mono text-slate-400">Tiempo promedio</span>
                  </div>
                  <div className="text-center p-5 bg-white/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/20 mb-3">
                    <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {analytics.tiempoPromedioResolucionHoras?.toFixed(1) || 0}
                      <span className="text-sm font-normal text-slate-400 ml-1">horas</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Tiempo promedio de resolución</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-white/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/20">
                      <p className="text-xl font-extrabold text-slate-800 dark:text-white">{analytics.resueltos || 0}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Resueltos</p>
                    </div>
                    <div className="text-center p-3 bg-white/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/20">
                      <p className="text-xl font-extrabold text-slate-800 dark:text-white">{analytics.cerrados || 0}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Cerrados</p>
                    </div>
                  </div>
                  {analytics.tendenciaUltimos7Dias?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Tendencia 7 días</p>
                      <div className="h-20" style={{ minWidth: 0, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analytics.tendenciaUltimos7Dias}>
                            <defs>
                              <linearGradient id="tCre" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5}/><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                              <linearGradient id="tRes" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.5}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="creados" stroke="#8b5cf6" strokeWidth={2} fill="url(#tCre)" dot={false} />
                            <Area type="monotone" dataKey="resueltos" stroke="#10b981" strokeWidth={2} fill="url(#tRes)" dot={false} />
                            <XAxis dataKey="fecha" tickFormatter={v => v?.substring(5)} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip content={<CustomAnalyticsTooltip />} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 mt-1">
                        <span className="flex items-center gap-1 text-[9px] text-slate-400"><span className="w-2 h-2 rounded-full bg-violet-500" /> Creados</span>
                        <span className="flex items-center gap-1 text-[9px] text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Resueltos</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Distribución por Prioridad</h3>
                  </div>
                  {analytics.porPrioridad && Object.entries(analytics.porPrioridad).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(analytics.porPrioridad).map(([p, count], i) => {
                        const cfg = prioridadConfig[p] || { label: p, color: 'bg-slate-100 text-slate-600' };
                        const total = Object.values(analytics.porPrioridad).reduce((a, b) => a + b, 0) || 1;
                        const pct = (count / total) * 100;
                        return (
                          <div key={p}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                              <span className="text-slate-400 font-mono">{count} ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: pct + '%' }} transition={{ duration: 0.7, delay: i * 0.06 }}
                                className="h-full rounded-full" style={{ background: cfg.dot?.replace('bg-', '#') || '#8b5cf6' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">Sin datos de prioridad</p>
                  )}
                </motion.div>
                <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Tickets por Usuario</h3>
                  </div>
                  {analytics.ticketsPorUsuario && Object.entries(analytics.ticketsPorUsuario).length > 0 ? (
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                      {Object.entries(analytics.ticketsPorUsuario)
                        .sort((a, b) => b[1] - a[1]).map(([userName, count], i) => (
                        <motion.div key={userName} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/20 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold shadow-md">
                              {userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{userName}</span>
                          </div>
                          <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400">{count}</span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">Sin datos de usuarios</p>
                  )}
                </motion.div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-20">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full" />
            </div>
          )}
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'from-slate-500 to-slate-600', icon: TicketCheck },
              { label: 'Abiertos', value: stats.abiertos, color: 'from-blue-500 to-blue-600', icon: AlertCircle },
              { label: 'En Progreso', value: stats.enProgreso, color: 'from-amber-500 to-amber-600', icon: Loader },
              { label: 'Resueltos', value: stats.resueltos, color: 'from-emerald-500 to-emerald-600', icon: CheckCircle },
            ].map(s => (
              <motion.div key={s.label} variants={itemAnim} whileHover={{ y: -2 }}
                className="glass-card-neon rounded-xl p-3.5 text-center relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${s.color} opacity-[0.04] rounded-full -translate-y-6 translate-x-6`} />
                <p className="text-xl font-extrabold text-slate-800 dark:text-white">{s.value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['TODOS', 'ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO'].map(f => (
                <motion.button key={f} whileTap={{ scale: 0.97 }}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                    filter === f ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}>
                  {f === 'TODOS' ? 'Todos' : statusConfig[f]?.label || f}
                </motion.button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar tickets..." className="w-full sm:w-56 pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-500 justify-center py-20"><AlertCircle className="w-5 h-5" /><span className="text-sm font-medium">{error}</span></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <TicketCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold">No hay tickets {filter !== 'TODOS' ? statusConfig[filter]?.label.toLowerCase() : ''}</p>
              {search && <p className="text-xs mt-1">para la búsqueda &quot;{search}&quot;</p>}
            </div>
          ) : (
            <motion.div variants={container} className="space-y-2.5">
              {filtered.map(t => {
                const pConf = prioridadConfig[t.prioridad] || prioridadConfig.MEDIA;
                const sConf = statusConfig[t.status] || statusConfig.ABIERTO;
                const SIcon = sConf.icon;
                const catConf = categoryConfig[t.categoria] || { label: t.categoria || '', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: HelpCircle };
                const CatIcon = catConf.icon;
                return (
                  <motion.div key={t.id} variants={itemAnim} layout
                    className={`glass-card-neon rounded-xl p-4 border-l-4 ${pConf.border} hover:shadow-lg transition-all relative overflow-hidden group`}>
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">{t.titulo}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pConf.color}`}>{pConf.label}</span>
                          {t.categoria && (
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${catConf.color}`}>
                              <CatIcon className="w-2.5 h-2.5" />{catConf.label}
                            </span>
                          )}
                        </div>
                        {t.descripcion && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{t.descripcion}</p>}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{t.creadoPor}</span>
                          {t.asignadoA && <span>· {t.asignadoA}</span>}
                          <span>· {new Date(t.createdAt).toLocaleDateString('es-CL')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${sConf.color}`}>
                          <SIcon className="w-3 h-3" />{sConf.label}
                        </span>
                        <div className="relative">
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                          <motion.div initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 min-w-[150px] z-20 hidden group-hover:block"
                            onMouseEnter={e => e.stopPropagation()}>
                            {statusFlow.map(key => {
                              const val = statusConfig[key];
                              return (
                                <button key={key} onClick={() => handleStatus(t.id, key)}
                                  className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${t.status === key ? 'font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700/30' : 'text-slate-600 dark:text-slate-400'}`}>
                                  <val.icon className="w-3.5 h-3.5" />{val.label}
                                </button>
                              );
                            })}
                            <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                              <button onClick={() => handleDelete(t.id)}
                                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" /> Eliminar
                              </button>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }} className="glass-card-neon rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Crear Nuevo Ticket</h3>
                <motion.button whileHover={{ rotate: 90 }} onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </motion.button>
              </div>

              {(form.titulo.trim().length >= 5 || form.descripcion.trim()) && !categoriaSugerida && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={handleAutoClasificar} disabled={clasificando}
                  className="w-full mb-4 flex items-center justify-center gap-2 px-3 py-2.5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-xl text-xs font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-all">
                  {clasificando ? (
                    <><Loader className="w-3.5 h-3.5 animate-spin" /> Clasificando con IA...</>
                  ) : (
                    <><Brain className="w-3.5 h-3.5" /> Clasificar automáticamente</>
                  )}
                </motion.button>
              )}
              {categoriaSugerida && (
                <div className="mb-4 flex items-center gap-2 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs">
                  <Brain className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-medium">Categoría sugerida:</span>
                  {(() => {
                    const cfg = categoryConfig[categoriaSugerida] || { label: categoriaSugerida, color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: HelpCircle };
                    const CatIcon = cfg.icon;
                    return <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold ${cfg.color}`}><CatIcon className="w-3 h-3" />{cfg.label}</span>;
                  })()}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Título *</label>
                  <input type="text" value={form.titulo} onChange={e => { setForm({ ...form, titulo: e.target.value }); setFormErrors({ ...formErrors, titulo: '' }); setCategoriaSugerida(null); }}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all ${formErrors.titulo ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                    placeholder="Ej: Error en el sistema de facturación..." />
                  {formErrors.titulo && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.titulo}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Descripción</label>
                  <textarea value={form.descripcion} onChange={e => { setForm({ ...form, descripcion: e.target.value }); setFormErrors({ ...formErrors, descripcion: '' }); }}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 resize-none transition-all ${formErrors.descripcion ? 'border-red-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                    rows={3} placeholder="Describe el problema en detalle..." />
                  {formErrors.descripcion && <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.descripcion}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Prioridad</label>
                  <select value={form.prioridad} onChange={e => setForm({ ...form, prioridad: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all hover:border-slate-300 dark:hover:border-slate-600">
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="CRITICA">Crítica</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                  <motion.button type="submit" whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-600/20">Crear Ticket</motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

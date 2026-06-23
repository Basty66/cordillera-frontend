import { useEffect, useState } from 'react';
import { getDashboard, getIndicadoresEconomicos, getClimaSucursales, getTicketAnalytics } from '../api/client';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import {
  ShoppingCart, DollarSign, TrendingUp, RefreshCw, Package,
  AlertCircle, Users, Store, Sun, Cloud, CloudRain,
  Droplets, TrendingDown, Wallet, BadgePercent,
  TicketCheck, Target, Zap, HelpCircle, Activity, Wifi,
  BarChart3, ArrowUpRight, ArrowDownRight, ChevronRight,
  Hexagon, Sparkles, Globe
} from 'lucide-react';

function formatCLP(n) {
  return '$' + Number(n).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const springTransition = { type: 'spring', stiffness: 200, damping: 25 };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.035 } } };
const itemAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: springTransition } };

const weatherIcon = (desc) => {
  if (!desc) return <Sun className="w-4 h-4 text-amber-400" />;
  const d = desc.toLowerCase();
  if (d.includes('lluv') || d.includes('lloviz')) return <CloudRain className="w-4 h-4 text-blue-400" />;
  if (d.includes('nubl') || d.includes('nube')) return <Cloud className="w-4 h-4 text-slate-400" />;
  return <Sun className="w-4 h-4 text-amber-400" />;
};

const catIcons = {
  TÉCNICO: Zap, FACTURACIÓN: DollarSign, RECLAMO: AlertCircle, CONSULTA: HelpCircle,
};

const monthColors = ['#3b82f6','#60a5fa','#818cf8','#a78bfa','#c084fc','#e879f9','#f472b6','#fb7185','#f87171','#fbbf24','#34d399','#10b981'];

function AnimatedCounter({ value, suffix = '', prefix = '', format = true }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    if (end === 0) { setDisplay(0); return; }
    const duration = 800;
    const step = Math.max(1, Math.floor(end / (duration / 16)));
    let running = true;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { if (running) setDisplay(end); clearInterval(timer); }
      else if (running) setDisplay(start);
    }, 16);
    return () => { running = false; clearInterval(timer); };
  }, [value]);
  const formatted = format ? Number(display).toLocaleString('es-CL') : display;
  return <>{prefix}{formatted}{suffix}</>;
}

function HeroSection({ date }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 group"
      style={{background: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #064e3b 70%, #047857 100%)'}}>
      {/* Animated aurora */}
      <motion.div className="absolute -top-40 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 60%)'}}
        animate={{ x: [0, 20, -10, 0], y: [0, -15, 10, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%)'}}
        animate={{ x: [0, -20, 15, 0], y: [0, 15, -10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 card-pattern-dots opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}
                className="p-1 bg-emerald-400/20 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </motion.div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300/80">Panel de Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Dashboard Corporativo</h1>
            <p className="text-sm text-white/50 mt-1 capitalize">{date}</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400/10 rounded-xl border border-emerald-400/20 backdrop-blur-sm">
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              <span className="text-xs font-medium text-emerald-300">En Vivo</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color, trend, delay = 0 }) {
  return (
    <motion.div variants={itemAnim} custom={delay} whileHover={{ y: -4, scale: 1.01 }} className="premium-card-neon rounded-xl p-3.5 transition-all duration-200 group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-3 rounded-full -translate-y-8 translate-x-8 group-hover:opacity-5 transition-opacity`} />
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <div className={`p-2 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <p className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
        <AnimatedCounter value={value} />
      </p>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-[10px] font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
          <span>{Math.abs(trend)}% vs mes anterior</span>
        </div>
      )}
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="premium-card rounded-xl p-5">
            <div className="flex justify-between mb-3"><div className="skeleton h-4 w-20" /><div className="skeleton h-8 w-8 rounded-lg" /></div>
            <div className="skeleton h-8 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="premium-card rounded-xl p-5">
            <div className="skeleton h-5 w-40 mb-4" /><div className="skeleton h-[250px] w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold text-slate-800 dark:text-white">{formatCLP(p.value)}</p>
      ))}
    </div>
  );
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [economico, setEconomico] = useState(null);
  const [clima, setClima] = useState(null);
  const [ticketAnalytics, setTicketAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setRefreshing(true);
      const results = await Promise.allSettled([
        getDashboard(), getIndicadoresEconomicos(), getClimaSucursales(), getTicketAnalytics()
      ]);
      if (results[0].status === 'fulfilled') setData(results[0].value);
      if (results[1].status === 'fulfilled') setEconomico(results[1].value);
      if (results[2].status === 'fulfilled') setClima(results[2].value);
      if (results[3].status === 'fulfilled') setTicketAnalytics(results[3].value);
      const allFailed = results.every(r => r.status === 'rejected');
      if (allFailed) setError('No se pudieron cargar los datos. Verifica que los servicios estén en ejecución.');
      else setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); return () => setRefreshing(false); }, []);

  if (error) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[50vh] gap-5">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/5 rounded-3xl shadow-xl">
        <AlertCircle className="w-12 h-12 text-red-400" />
      </motion.div>
      <div className="text-center">
        <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">Error al cargar datos</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">{error}</p>
      </div>
      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={load} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all">
        <RefreshCw className="w-4 h-4" /> Reintentar
      </motion.button>
    </motion.div>
  );

  if (!data) return <LoadingSkeleton />;

  const ecoInd = economico?.indicadores || {};
  const climaList = clima || [];
  const ta = ticketAnalytics;
  const ventasMensuales = data.ventasMensuales || [];
  const ventasCategoria = data.ventasPorCategoria || [];
  const topProductos = data.topProductos || [];
  const indicadoresList = data.indicadores || [];

  const rechartsBar = ventasMensuales.map(v => ({
    mes: v.mes.substring(0, 3) + ' ' + v.anio?.toString().slice(-2),
    monto: v.montoTotal,
  }));

  const ecoCards = [
    { key: 'UF', label: 'Unidad de Fomento', icon: Wallet, color: 'from-emerald-500 to-emerald-600' },
    { key: 'DOLAR', label: 'Dólar Observado', icon: Wallet, color: 'from-blue-500 to-blue-600' },
    { key: 'UTM', label: 'Unidad Tributaria Mensual', icon: BadgePercent, color: 'from-violet-500 to-violet-600' },
    { key: 'IPC', label: 'Índice Precios Consumidor', icon: TrendingUp, color: 'from-amber-500 to-amber-600' },
  ];

  const microservices = [
    { name: 'ms-ventas', port: 8081, icon: ShoppingCart, color: 'from-blue-500 to-blue-600', desc: 'Ventas, Productos, Sucursales' },
    { name: 'ms-datos-org', port: 8082, icon: Users, color: 'from-amber-500 to-amber-600', desc: 'Empleados, Departamentos' },
    { name: 'ms-indicadores', port: 8083, icon: BarChart3, color: 'from-violet-500 to-violet-600', desc: 'KPIs, Indicadores' },
    { name: 'bff', port: 8090, icon: Activity, color: 'from-cyan-500 to-cyan-600', desc: 'Auth, Tickets, Reportes' },
    { name: 'api-gateway', port: 8084, icon: Wifi, color: 'from-rose-500 to-rose-600', desc: 'Enrutamiento, CB' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">

      <HeroSection date={new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />

      <div className="relative">
        <div className="divider-gradient mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20">
              <BadgePercent className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Indicadores Económicos</h3>
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">API Externa</span>
            <span className="text-[10px] text-slate-400 font-mono">mindicador.cl</span>
            {economico?.fecha === 'Simulado' && (
              <span className="text-[10px] text-amber-500 flex items-center gap-1"><Cloud className="w-3 h-3" /> Simulado</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {economico?.fecha && economico.fecha !== 'Simulado' && (
              <span className="text-[10px] text-slate-400">{new Date(economico.fecha).toLocaleDateString('es-CL')}</span>
            )}
            <motion.button whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}
              onClick={load} disabled={refreshing}
              className="p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all active:scale-95 disabled:opacity-50"
              title="Actualizar datos">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>
      </div>

      <motion.div variants={itemAnim} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {ecoCards.map(({ key, label, icon: Icon, color }) => {
          const ind = ecoInd[key];
          if (!ind) return null;
          const isPositive = ind.valor >= 0;
          return (
            <motion.div key={key} whileHover={{ y: -3 }} className="premium-card-neon rounded-xl p-3.5 relative overflow-hidden group">
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">{key}</span>
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${color} shadow-md`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-800 dark:text-white mb-0.5">
                  {key === 'IPC' ? ind.valor.toFixed(1) + '%' : formatCLP(ind.valor)}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{label}</p>
                <div className="mt-1.5 flex items-center gap-1">
                  {key === 'IPC' && (
                    isPositive
                      ? <><TrendingUp className="w-3 h-3 text-emerald-500" /><span className="text-[9px] text-emerald-500 font-medium">Alza</span></>
                      : <><TrendingDown className="w-3 h-3 text-red-400" /><span className="text-[9px] text-red-400 font-medium">Baja</span></>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="divider-gradient my-1.5" />
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg shadow-lg shadow-violet-500/20">
          <Hexagon className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Arquitectura de Microservicios</h3>
      </div>

      <motion.div variants={itemAnim} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
        {microservices.map((ms) => (
          <motion.div key={ms.name} whileHover={{ y: -3, scale: 1.02 }}
            className="premium-card-neon rounded-lg p-2.5 flex items-center gap-2 group relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${ms.color} opacity-[0.02] group-hover:opacity-[0.06] transition-opacity`} />
            <div className={`p-2 rounded-lg bg-gradient-to-br ${ms.color} shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              <ms.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0 relative">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{ms.name}</p>
              <p className="text-[9px] text-slate-400 truncate leading-tight">{ms.desc}</p>
            </div>
            <ChevronRight className="w-3 h-3 text-emerald-400 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
      </motion.div>
        ))}
      </motion.div>

      <div className="divider-gradient my-1.5" />
      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <KpiCard label="Total Ventas" value={data.ventas.totalVentas} icon={ShoppingCart} color="from-blue-500 to-blue-600" trend={12} />
        <KpiCard label="Monto Total" value={data.ventas.montoTotal} icon={DollarSign} color="from-emerald-500 to-emerald-600" trend={8} />
        <KpiCard label="Ticket Promedio" value={data.ventas.promedioVenta} icon={TrendingUp} color="from-violet-500 to-violet-600" />
        <KpiCard label="Empleados" value={data.totalEmpleados} icon={Users} color="from-amber-500 to-amber-600" />
        <KpiCard label="Sucursales" value={data.totalSucursales} icon={Store} color="from-rose-500 to-rose-600" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <motion.div variants={itemAnim} className="premium-card-neon rounded-xl p-3.5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2.5">
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Clima · Sucursales</span>
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">API Externa</span>
            <span className="ml-auto text-[9px] font-mono text-slate-400">OpenWeatherMap</span>
          </div>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {climaList.length > 0 ? climaList.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/20 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-slate-700 dark:to-slate-700/50 group-hover:scale-110 transition-transform">{weatherIcon(c.descripcion)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{c.ciudad}</p>
                  <p className="text-[11px] text-slate-400 capitalize truncate">{c.descripcion || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-slate-800 dark:text-white">{c.temperatura?.toFixed(0) || '—'}°</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                    <Droplets className="w-3 h-3" />{c.humedad?.toFixed(0) || '—'}%
                  </p>
                </div>
              </motion.div>
            )) : (
              <p className="text-xs text-slate-400 text-center py-8">Cargando datos climáticos...</p>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="premium-card-neon rounded-xl p-3.5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-2.5">
            <TicketCheck className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Analytics · Tickets</span>
            <span className="ml-auto text-[9px] font-mono text-slate-400">Clasificación IA</span>
          </div>
          {ta ? (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Abiertos', value: ta.abiertos, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                  { label: 'En Progreso', value: ta.enProgreso, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                  { label: 'Críticos', value: ta.criticosAbiertos, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
                  { label: 'Tiempo Prom.', value: ta.tiempoPromedioResolucionHoras?.toFixed(0) + 'h', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                ].map(s => (
                  <motion.div key={s.label} whileHover={{ y: -2 }} className={`${s.bg} rounded-xl p-2 text-center border border-slate-100 dark:border-slate-700/20`}>
                    <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-medium uppercase tracking-wide">{s.label}</p>
                  </motion.div>
                ))}
              </div>
              {ta.tendenciaUltimos7Dias?.length > 0 && (
                <div className="h-12" style={{ minWidth: 0, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ta.tendenciaUltimos7Dias.map((d, i) => ({ ...d, idx: i }))}>
                      <defs>
                        <linearGradient id="creadosGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6}/><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                        <linearGradient id="resueltosGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.6}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="creados" stroke="#8b5cf6" strokeWidth={2} fill="url(#creadosGrad)" dot={false} />
                      <Area type="monotone" dataKey="resueltos" stroke="#10b981" strokeWidth={2} fill="url(#resueltosGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              {ta.porCategoria && Object.keys(ta.porCategoria).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(ta.porCategoria).map(([cat, count]) => {
                    const CatIcon = catIcons[cat] || HelpCircle;
                    const colors = {
                      TÉCNICO: 'text-blue-600 bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200',
                      FACTURACIÓN: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200',
                      RECLAMO: 'text-red-600 bg-red-100 dark:bg-red-500/20 dark:text-red-400 border-red-200',
                      CONSULTA: 'text-violet-600 bg-violet-100 dark:bg-violet-500/20 dark:text-violet-400 border-violet-200',
                    };
                    return (
                      <span key={cat} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${colors[cat] || 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-400'}`}>
                        <CatIcon className="w-3 h-3" />{cat} <span className="text-slate-400 font-normal">({count})</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Cargando analytics...</p>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <motion.div variants={itemAnim} className="premium-card-neon rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Tendencia de Ventas Mensuales</h3>
            <span className="ml-auto text-[9px] font-mono text-slate-400">Data Warehouse</span>
          </div>
          {rechartsBar.length > 0 ? (
            <div className="h-[230px]" style={{ minWidth: 0, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rechartsBar} barCategoryGap="20%" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} width={50} tickFormatter={v => formatCLP(v)} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16,185,129,0.06)' }} />
                  <Bar dataKey="monto" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {rechartsBar.map((_, i) => (
                      <Cell key={i} fill={monthColors[i % 12]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Cargando datos mensuales...</p>
          )}
        </motion.div>

        <motion.div variants={itemAnim} className="premium-card-neon rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-3.5 h-3.5 text-violet-500" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Top Productos Más Vendidos</h3>
            <span className="ml-auto text-[9px] font-mono text-slate-400">ms-ventas</span>
          </div>
          {topProductos.length > 0 ? (
            <div className="space-y-1.5">
              {topProductos.map((p, i) => {
                const maxMonto = Math.max(...topProductos.map(x => x.montoTotal), 1);
                const pct = (p.montoTotal / maxMonto) * 100;
                return (
                  <motion.div key={p.productoId || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="relative overflow-hidden rounded-xl bg-white/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/20 p-2.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: pct + '%' }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-xl" transition={{ duration: 0.8, delay: i * 0.04 }} />
                    <div className="relative flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-md shrink-0 ${
                        i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                        i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                        i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                        'bg-gradient-to-br from-blue-400 to-blue-600'
                      }`}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{p.nombre}</p>
                        <p className="text-[11px] text-slate-400">{p.totalVendido} unidades</p>
                      </div>
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{formatCLP(p.montoTotal)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos de productos</p>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <motion.div variants={itemAnim} className="premium-card-neon rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <BarChart3 className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Ventas por Categoría</h3>
            <span className="ml-auto text-[9px] font-mono text-slate-400">Distribución</span>
          </div>
          {ventasCategoria.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="h-[120px] w-[120px] shrink-0" style={{ minWidth: 0, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ventasCategoria.map((c, i) => ({ ...c, fill: monthColors[i % 12] }))}
                      cx="50%" cy="50%" innerRadius={32} outerRadius={58} dataKey="montoTotal" paddingAngle={3}
                    >
                      {ventasCategoria.map((_, i) => (
                        <Cell key={i} fill={monthColors[i % 12]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => formatCLP(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
                {ventasCategoria.map((c, i) => {
                  const total = ventasCategoria.reduce((s, x) => s + x.montoTotal, 0) || 1;
                  const pct = ((c.montoTotal / total) * 100).toFixed(0);
                  return (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: monthColors[i % 12] }} />
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{c.categoria}</span>
                      <span className="text-slate-400 ml-auto font-mono">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Cargando categorías...</p>
          )}
        </motion.div>

        <motion.div variants={itemAnim} className="premium-card-neon rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg shadow-lg shadow-violet-500/20">
              <Target className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Indicadores Clave</h3>
            <span className="ml-auto text-[9px] font-mono text-slate-400">ms-indicadores</span>
          </div>
          {indicadoresList.length > 0 ? (
            <div className="space-y-1.5">
              {indicadoresList.map((ind, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/20 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 shadow-lg shadow-violet-500/30 group-hover:scale-125 transition-transform" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{ind.nombre}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{ind.unidad}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-extrabold ${ind.unidad === 'CLP' ? 'text-emerald-600' : 'text-violet-600'}`}>
                      {ind.unidad === 'CLP' ? formatCLP(ind.valorActual) : Number(ind.valorActual).toFixed(1) + (ind.unidad === '%' ? '%' : '')}
                    </span>
                    <p className="text-[9px] text-slate-400">{ind.periodo}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Indicadores no disponibles</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

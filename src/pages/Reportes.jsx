import { useEffect, useState } from 'react';
import { getReportesDashboard, getDashboard, getVentasMensuales, getVentasPorCategoria, getTopProductos, exportCSV } from '../api/client';
import { motion } from 'framer-motion';
import {
  FileText, Download, BarChart3, TicketCheck, Users, AlertTriangle,
  TrendingUp, ShoppingCart, Package, Store
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';

function formatCLP(n) {
  return '$' + Number(n).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Reportes() {
  const [reportData, setReportData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [ventasCategoria, setVentasCategoria] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    Promise.all([
      getReportesDashboard().catch(() => null),
      getDashboard().catch(() => null),
      getVentasMensuales().catch(() => []),
      getVentasPorCategoria().catch(() => []),
      getTopProductos(10).catch(() => []),
    ]).then(([rep, dash, vm, vc, tp]) => {
      setReportData(rep);
      setDashboardData(dash);
      setVentasMensuales(vm);
      setVentasCategoria(vc);
      setTopProductos(tp);
    }).finally(() => setLoading(false));
  }, []);

  const exportJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportGeneralCSV = () => {
    const rows = [
      { Metrica: 'Total Ventas', Valor: dashboardData?.ventas?.totalVentas || 0 },
      { Metrica: 'Total Empleados', Valor: dashboardData?.totalEmpleados || 0 },
      { Metrica: 'Total Sucursales', Valor: dashboardData?.totalSucursales || 0 },
      { Metrica: 'Total Tickets', Valor: reportData?.totalTickets || 0 },
      { Metrica: 'Usuarios Registrados', Valor: reportData?.totalUsuarios || 0 },
      { Metrica: 'Tickets Criticos', Valor: reportData?.ticketsCriticos || 0 },
      { Metrica: 'Tickets Resueltos', Valor: reportData?.ticketsResueltos || 0 },
    ];
    exportCSV(rows, 'resumen-general.csv');
  };

  const handleExportTicketsCSV = () => {
    const rows = [
      { Estado: 'Abiertos', Cantidad: reportData?.ticketsAbiertos || 0 },
      { Estado: 'En Progreso', Cantidad: reportData?.ticketsEnProgreso || 0 },
      { Estado: 'Resueltos', Cantidad: reportData?.ticketsResueltos || 0 },
      { Estado: 'Cerrados', Cantidad: reportData?.ticketsCerrados || 0 },
    ];
    if (reportData?.porPrioridad) {
      Object.entries(reportData.porPrioridad).forEach(([pri, count]) => {
        rows.push({ Estado: 'Prioridad: ' + pri, Cantidad: count });
      });
    }
    exportCSV(rows, 'reporte-tickets.csv');
  };

  const handleExportVentasCSV = () => {
    const v = dashboardData?.ventas || {};
    const rows = [
      { Metrica: 'Total Ventas', Valor: v.totalVentas || 0 },
      { Metrica: 'Monto Total', Valor: v.montoTotal || 0 },
      { Metrica: 'Ticket Promedio', Valor: v.promedioVenta || 0 },
    ];
    exportCSV(rows, 'reporte-ventas.csv');
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
    </div>
  );

  const monthColors = ['#3b82f6','#60a5fa','#818cf8','#a78bfa','#c084fc','#e879f9','#f472b6','#fb7185','#f87171','#fbbf24','#34d399','#10b981'];

  const monthlyBarData = ventasMensuales.length ? {
    labels: ventasMensuales.map(v => v.mes.substring(0, 3)),
    datasets: [{ label: 'Monto Total', data: ventasMensuales.map(v => v.montoTotal),
      backgroundColor: ventasMensuales.map((_, i) => monthColors[i % 12]), borderRadius: 6 }],
  } : null;

  const categoryDoughnutData = ventasCategoria.length ? {
    labels: ventasCategoria.map(c => c.categoria),
    datasets: [{ data: ventasCategoria.map(c => c.montoTotal),
      backgroundColor: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316'], borderWidth: 0 }],
  } : null;

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={itemAnim} className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Reportes</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">Análisis, tendencias y exportación de datos</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemAnim} className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'general', label: 'General', icon: BarChart3 },
          { id: 'tickets', label: 'Tickets', icon: TicketCheck },
          { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
          { id: 'productos', label: 'Productos', icon: Package },
          { id: 'tendencias', label: 'Tendencias', icon: TrendingUp },
        ].map(tab => (
          <motion.button key={tab.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Tab: General */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white">Resumen General</h3>
              <div className="flex gap-1.5">
                <button onClick={handleExportGeneralCSV}
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-500 font-medium">
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button onClick={() => exportJSON(dashboardData, 'resumen-general.json')}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 font-medium">
                  <Download className="w-3.5 h-3.5" /> JSON
                </button>
              </div>
            </div>
            <div className="h-[250px]">
              <Bar data={{
                labels: ['Ventas', 'Empleados', 'Sucursales'],
                datasets: [{ label: 'Totales', data: [dashboardData?.ventas?.totalVentas || 0, dashboardData?.totalEmpleados || 0, dashboardData?.totalSucursales || 0],
                  backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'], borderRadius: 8 }],
              }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </motion.div>

          {reportData && (
            <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Estadísticas del Sistema</h3>
              <div className="space-y-3">
                {[
                  { icon: TicketCheck, label: 'Total Tickets', value: reportData.totalTickets, color: 'from-violet-500 to-violet-600' },
                  { icon: Users, label: 'Usuarios Registrados', value: reportData.totalUsuarios, color: 'from-blue-500 to-blue-600' },
                  { icon: AlertTriangle, label: 'Tickets Críticos', value: reportData.ticketsCriticos, color: 'from-red-500 to-red-600' },
                  { icon: TrendingUp, label: 'Tickets Resueltos', value: reportData.ticketsResueltos, color: 'from-emerald-500 to-emerald-600' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${s.color} shadow-md`}><s.icon className="w-4 h-4 text-white" /></div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{s.label}</span>
                    </div>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Tab: Tickets */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white">Tickets por Estado</h3>
              <div className="flex gap-1.5">
                <button onClick={handleExportTicketsCSV}
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-500 font-medium">
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button onClick={() => exportJSON(reportData, 'reporte-tickets.json')}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 font-medium">
                  <Download className="w-3.5 h-3.5" /> JSON
                </button>
              </div>
            </div>
            <div className="h-[250px]">
              <Bar data={{
                labels: ['Abiertos', 'En Progreso', 'Resueltos', 'Cerrados'],
                datasets: [{ label: 'Tickets', data: [reportData?.ticketsAbiertos || 0, reportData?.ticketsEnProgreso || 0, reportData?.ticketsResueltos || 0, reportData?.ticketsCerrados || 0],
                  backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#94a3b8'], borderRadius: 8 }],
              }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
            </div>
          </motion.div>

          {reportData?.porPrioridad && (
            <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Distribución por Prioridad</h3>
              <div className="h-[250px] flex items-center justify-center">
                <Doughnut data={{
                  labels: Object.keys(reportData.porPrioridad).map(p => ({ CRITICA: 'Crítica', ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja' })[p] || p),
                  datasets: [{ data: Object.values(reportData.porPrioridad), backgroundColor: ['#ef4444', '#f97316', '#3b82f6', '#94a3b8'], borderWidth: 0 }],
                }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Tab: Ventas */}
      {activeTab === 'ventas' && dashboardData?.ventas && (
        <div className="space-y-6">
          <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-white">Resumen de Ventas</h3>
              <div className="flex gap-1.5">
                <button onClick={handleExportVentasCSV}
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-500 font-medium">
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button onClick={() => exportJSON(dashboardData.ventas, 'reporte-ventas.json')}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500 font-medium">
                  <Download className="w-3.5 h-3.5" /> JSON
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Ventas', value: dashboardData.ventas.totalVentas, icon: ShoppingCart },
                { label: 'Monto Total', value: formatCLP(dashboardData.ventas.montoTotal), icon: TrendingUp },
                { label: 'Ticket Promedio', value: formatCLP(dashboardData.ventas.promedioVenta), icon: BarChart3 },
              ].map(s => (
                <div key={s.label} className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl text-center border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                  <s.icon className="w-5 h-5 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Ventas por Categoría</h3>
              {categoryDoughnutData ? (
                <div className="h-[280px] flex items-center justify-center">
                  <Doughnut data={categoryDoughnutData} options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12 } },
                      tooltip: { callbacks: { label: ctx => ctx.label + ': ' + formatCLP(ctx.raw) } } },
                  }} />
                </div>
              ) : <p className="text-slate-400 text-sm text-center py-8">Sin datos</p>}
            </motion.div>

            <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Ventas por Sucursal</h3>
              {dashboardData?.ventas?.totalVentas > 0 ? (
                <div className="h-[280px]">
                  <Bar data={{
                    labels: ventasMensuales.length ? ventasMensuales.map(v => v.mes.substring(0, 3)) : ['Sin datos'],
                    datasets: [{ label: 'Monto', data: ventasMensuales.length ? ventasMensuales.map(v => v.montoTotal) : [0],
                      backgroundColor: monthColors, borderRadius: 6 }],
                  }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { callback: v => formatCLP(v) } } } }} />
                </div>
              ) : <p className="text-slate-400 text-sm text-center py-8">Sin datos</p>}
            </motion.div>
          </div>
        </div>
      )}

      {/* Tab: Productos */}
      {activeTab === 'productos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" /> Top 10 Productos
            </h3>
            {topProductos.length > 0 ? (
              <div className="space-y-2">
                {topProductos.map((p, i) => (
                  <div key={p.productoId} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-md ${
                      i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                      i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                      i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                      'bg-gradient-to-br from-blue-400 to-blue-600'
                    }`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{p.nombre}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{p.totalVendido} unidades</p>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{formatCLP(p.montoTotal)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-slate-400 text-sm text-center py-8">Sin datos de productos</p>}
          </motion.div>

          <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Store className="w-4 h-4 text-rose-500" /> Ventas por Sucursal
            </h3>
            {dashboardData?.ventas?.totalVentas > 0 ? (
              <div className="h-[280px]">
                <Bar data={{
                  labels: ['Total'],
                  datasets: [{ label: 'Ventas', data: [dashboardData.ventas.totalVentas], backgroundColor: '#10b981', borderRadius: 8 }],
                }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
            ) : <p className="text-slate-400 text-sm text-center py-8">Sin datos</p>}
          </motion.div>
        </div>
      )}

      {/* Tab: Tendencias */}
      {activeTab === 'tendencias' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Tendencia Mensual de Ventas
              <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-auto">Data Warehouse</span>
            </h3>
            {monthlyBarData ? (
              <div className="h-[300px]">
                <Bar data={monthlyBarData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => formatCLP(ctx.raw) } } },
                  scales: { y: { beginAtZero: true, ticks: { callback: v => formatCLP(v) } } },
                }} />
              </div>
            ) : <p className="text-slate-400 text-sm text-center py-12">Sin datos históricos</p>}
          </motion.div>

          <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Distribución por Categoría</h3>
            {categoryDoughnutData ? (
              <div className="h-[300px] flex items-center justify-center">
                <Doughnut data={categoryDoughnutData} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { size: 11 } } },
                    tooltip: { callbacks: { label: ctx => ctx.label + ': ' + formatCLP(ctx.raw) } } },
                }} />
              </div>
            ) : <p className="text-slate-400 text-sm text-center py-12">Sin datos</p>}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

import { useEffect, useState } from 'react';
import { getVentasPaginadas, exportCSV } from '../api/client';
import { ShoppingCart, Search, Calendar, Store, Hash, DollarSign, Package, AlertCircle, Loader, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import DetailModal from '../components/DetailModal';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const tamaño = 20;

  useEffect(() => {
    setLoading(true);
    getVentasPaginadas(pagina, tamaño)
      .then(r => {
        const items = Array.isArray(r) ? r : (r?.content ?? []);
        setVentas(items);
        setTotal(r?.totalElements ?? (Array.isArray(r) ? r.length : items.length));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [pagina]);

  const totalPaginas = Math.ceil(total / tamaño);

  const filtered = (ventas ?? []).filter(v =>
    String(v.id).includes(search) ||
    v.sucursal?.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const data = ventas.map(v => ({
      ID: v.id,
      Sucursal: v.sucursal?.nombre || '',
      Fecha: new Date(v.fechaVenta).toLocaleDateString('es-CL'),
      Precio_Total: v.precioTotal,
      Monto_Total: v.montoTotal,
      Items: v.detalles?.length || 0,
    }));
    exportCSV(data, 'ventas.csv');
  };

  if (error) return (
    <motion.div initial={{ opacity: 0 }} className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-200 dark:border-red-500/20">
      <AlertCircle className="w-5 h-5" /><span className="font-medium">{error}</span>
    </motion.div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={itemAnim} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ventas <span className="text-slate-400 dark:text-slate-500 text-lg font-normal">({total})</span></h2>
            <p className="text-sm text-slate-400 dark:text-slate-500">Historial de transacciones — haz clic para ver detalles</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar venta..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 transition-all input-neon" />
          </div>
          <button onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all">
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          <motion.div variants={itemAnim} className="glass-card-neon rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-neon">
                <thead>
                  <tr className="text-slate-600 dark:text-slate-400 uppercase text-xs">
                    <th className="text-left p-4 font-semibold">ID</th>
                    <th className="text-left p-4 font-semibold">Sucursal</th>
                    <th className="text-left p-4 font-semibold">Fecha</th>
                    <th className="text-right p-4 font-semibold">Precio Total</th>
                    <th className="text-right p-4 font-semibold">Monto Total</th>
                    <th className="text-center p-4 font-semibold">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="6" className="text-center p-12 text-slate-400">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>Sin resultados</p>
                    </td></tr>
                  ) : filtered.map((v) => (
                    <motion.tr
                      key={v.id}
                      variants={itemAnim}
                      onClick={() => setSelected(v)}
                      className="cursor-pointer"
                    >
                      <td className="p-4 font-medium dark:text-slate-200">#{v.id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Store className="w-3.5 h-3.5 text-slate-400" />
                          {v.sucursal?.nombre || '-'}
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(v.fechaVenta).toLocaleDateString('es-CL')}
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium dark:text-slate-200">${Number(v.precioTotal).toLocaleString('es-CL')}</td>
                      <td className="p-4 text-right font-medium text-emerald-600 dark:text-emerald-400 font-bold">${Number(v.montoTotal).toLocaleString('es-CL')}</td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                          {v.detalles?.length || 0}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => setPagina(p => Math.max(0, p - 1))} disabled={pagina === 0}
                className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span className="text-sm text-slate-500">
                Página {pagina + 1} de {totalPaginas}
              </span>
              <button onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))} disabled={pagina >= totalPaginas - 1}
                className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      <DetailModal open={!!selected} onClose={() => setSelected(null)} title={`Venta #${selected?.id}`} size="max-w-lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Hash, label: 'ID Venta', value: `#${selected.id}`, color: 'text-blue-600 dark:text-blue-400' },
                { icon: Store, label: 'Sucursal', value: selected.sucursal?.nombre || '-', color: 'text-rose-600 dark:text-rose-400' },
                { icon: Calendar, label: 'Fecha', value: new Date(selected.fechaVenta).toLocaleDateString('es-CL'), color: 'text-amber-600 dark:text-amber-400' },
                { icon: DollarSign, label: 'Monto Total', value: `$${Number(selected.montoTotal).toLocaleString('es-CL')}`, color: 'text-emerald-600 dark:text-emerald-400', bold: true },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <item.icon className="w-3.5 h-3.5" /> {item.label}
                  </div>
                  <p className={`font-bold text-slate-800 dark:text-white ${item.color || ''}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {selected.detalles?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Detalles ({selected.detalles.length} items)
                </h4>
                <div className="space-y-2">
                  {selected.detalles.map((d, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{d.producto?.nombre || `Producto #${d.productoId}`}</p>
                        <p className="text-xs text-slate-400">Cant: {d.cantidad} × ${Number(d.precioUnitario).toLocaleString('es-CL')}</p>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-white text-sm">${Number(d.subtotal).toLocaleString('es-CL')}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DetailModal>
    </motion.div>
  );
}

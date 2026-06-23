import { useEffect, useState } from 'react';
import { getSucursales } from '../api/client';
import { MapPin, Building2, Navigation, Hash, Globe, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import DetailModal from '../components/DetailModal';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function getBranchImage(sucursal) {
  if (sucursal.imagenUrl) return sucursal.imagenUrl;
  const city = (sucursal.ciudad || 'chile').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
  return `https://picsum.photos/seed/${city}${sucursal.id}/600/400`;
}

export default function Sucursales() {
  const [sucursales, setSucursales] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getSucursales()
      .then(setSucursales)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) return (
    <motion.div initial={{ opacity: 0 }} className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-200 dark:border-red-500/20">
      <AlertCircle className="w-5 h-5" /><span className="font-medium">{error}</span>
    </motion.div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={itemAnim} className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg shadow-rose-500/20">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Sucursales <span className="text-slate-400 dark:text-slate-500 text-lg font-normal">({sucursales.length})</span></h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">Nuestras ubicaciones — haz clic para ver detalles</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      ) : (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sucursales.map(s => (
            <motion.div
              key={s.id}
              variants={itemAnim}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 200 } }}
              onClick={() => setSelected(s)}
              className="glass-card-neon rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="h-32 bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                <img src={getBranchImage(s)} alt={s.nombre}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{s.nombre}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{s.ciudad}</p>
                    {s.direccion && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{s.direccion}</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <DetailModal open={!!selected} onClose={() => setSelected(null)} title={selected?.nombre} size="max-w-lg">
        {selected && (
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 h-48 shadow-inner">
              <img src={getBranchImage(selected)} alt={selected.nombre} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Hash, label: 'ID', value: selected.id, colSpan: '' },
                { icon: Globe, label: 'Ciudad', value: selected.ciudad, colSpan: '' },
                { icon: Navigation, label: 'Dirección', value: selected.direccion || 'No registrada', colSpan: 'col-span-2' },
              ].map((item, i) => (
                <div key={i} className={`p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 ${item.colSpan}`}>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <item.icon className="w-3.5 h-3.5" /> {item.label}
                  </div>
                  <p className="font-medium text-slate-800 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </DetailModal>
    </motion.div>
  );
}

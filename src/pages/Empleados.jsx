import { useEffect, useState } from 'react';
import { getEmpleados } from '../api/client';
import { Users, Search, Mail, Briefcase, Building2, CheckCircle, XCircle, IdCard, AlertCircle, Loader } from 'lucide-react';
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

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getEmpleados()
      .then(setEmpleados)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = empleados.filter(e =>
    `${e.nombre} ${e.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
    e.cargo?.toLowerCase().includes(search.toLowerCase()) ||
    e.departamento?.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  if (error) return (
    <motion.div initial={{ opacity: 0 }} className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-200 dark:border-red-500/20">
      <AlertCircle className="w-5 h-5" /><span className="font-medium">{error}</span>
    </motion.div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={itemAnim} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Empleados <span className="text-slate-400 dark:text-slate-500 text-lg font-normal">({empleados.length})</span></h2>
            <p className="text-sm text-slate-400 dark:text-slate-500">Personal de la organización — haz clic para ver detalles</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Buscar empleados..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full sm:w-64 transition-all input-neon" />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={itemAnim} className="glass-card-neon rounded-xl p-12 text-center text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No se encontraron empleados</p>
        </motion.div>
      ) : (
        <motion.div variants={itemAnim} className="glass-card-neon rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-neon">
              <thead>
                <tr className="text-slate-600 dark:text-slate-400 uppercase text-xs">
                  <th className="text-left p-4 font-semibold">ID</th>
                  <th className="text-left p-4 font-semibold">Nombre</th>
                  <th className="text-left p-4 font-semibold">Cargo</th>
                  <th className="text-left p-4 font-semibold">Departamento</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-center p-4 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <motion.tr
                    key={e.id}
                    variants={itemAnim}
                    onClick={() => setSelected(e)}
                    className="cursor-pointer"
                  >
                    <td className="p-4 font-medium dark:text-slate-200">{e.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                          {e.nombre?.charAt(0)}{e.apellido?.charAt(0)}
                        </div>
                        <span className="font-medium dark:text-slate-200">{e.nombre} {e.apellido}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{e.cargo || '-'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium">
                        {e.departamento?.nombre || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{e.email || '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        e.activo ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                      }`}>
                        {e.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <DetailModal open={!!selected} onClose={() => setSelected(null)} title={`${selected?.nombre} ${selected?.apellido}`} size="max-w-md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-amber-50 dark:from-amber-500/10 to-amber-100/50 dark:to-amber-500/5 rounded-xl border border-amber-200/50 dark:border-amber-500/20">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shrink-0">
                {selected.nombre?.charAt(0)}{selected.apellido?.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">{selected.nombre} {selected.apellido}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selected.cargo || 'Sin cargo'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: IdCard, label: 'ID', value: selected.id },
                { icon: Building2, label: 'Departamento', value: selected.departamento?.nombre || '-' },
                { icon: Briefcase, label: 'Cargo', value: selected.cargo || '-' },
                { icon: Mail, label: 'Email', value: selected.email || '-' },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <item.icon className="w-3.5 h-3.5" /> {item.label}
                  </div>
                  <p className="font-medium text-slate-800 dark:text-white truncate">{item.value}</p>
                </div>
              ))}
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${
              selected.activo ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
            }`}>
              {selected.activo ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <span className={`font-medium ${selected.activo ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                {selected.activo ? 'Empleado Activo' : 'Empleado Inactivo'}
              </span>
            </div>
          </div>
        )}
      </DetailModal>
    </motion.div>
  );
}

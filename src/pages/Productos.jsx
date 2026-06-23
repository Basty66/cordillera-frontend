import { useEffect, useState } from 'react';
import { getProductos, updateProducto, deleteProducto, exportCSV } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Package, Search, X, DollarSign, Hash, Layers, AlertCircle, Loader, Download, Edit3, Trash2, Save, Filter } from 'lucide-react';
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

function getProductImage(producto) {
  if (producto.imagenUrl) return producto.imagenUrl;
  const cat = (producto.nombre || '').split(' ')[0].toLowerCase();
  return `https://picsum.photos/seed/${cat}${producto.id}/400/300`;
}

const categorias = ['Todas', 'Electrónica', 'Hogar', 'Ropa', 'Deportes', 'Alimentos', 'Libros'];

export default function Productos() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('Todas');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '' });
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    getProductos().then(setProductos).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const sorted = [...productos].sort((a, b) => a.id - b.id);
  const filtered = sorted.filter(p => {
    const matchSearch = !search || p.nombre?.toLowerCase().includes(search.toLowerCase()) || p.descripcion?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Todas' || (p.categoria || '').toLowerCase() === catFilter.toLowerCase();
    return matchSearch && matchCat;
  });

  const handleEdit = (p) => {
    setEditMode(true);
    setEditForm({ nombre: p.nombre, descripcion: p.descripcion || '', precio: String(p.precio), stock: String(p.stock) });
  };

  const handleSaveEdit = async () => {
    if (!editForm.nombre.trim()) return;
    try {
      const updated = await updateProducto(selected.id, {
        nombre: editForm.nombre,
        descripcion: editForm.descripcion,
        precio: parseFloat(editForm.precio),
        stock: parseInt(editForm.stock),
      });
      setProductos(productos.map(p => p.id === selected.id ? updated : p));
      setSelected(updated);
      setEditMode(false);
    } catch (e) {
      setError(e.response?.data || 'Error al actualizar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto permanentemente?')) return;
    setDeleting(id);
    try {
      await deleteProducto(id);
      setProductos(productos.filter(p => p.id !== id));
      setSelected(null);
    } catch (e) {
      setError(e.response?.data || 'Error al eliminar');
    } finally {
      setDeleting(null);
    }
  };

  const handleExportCSV = () => {
    const data = filtered.map(p => ({ ID: p.id, Nombre: p.nombre, Descripcion: p.descripcion || '', Precio: p.precio, Stock: p.stock }));
    exportCSV(data, 'productos.csv');
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
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Productos <span className="text-slate-400 dark:text-slate-500 text-lg font-normal">({filtered.length} de {productos.length})</span></h2>
            <p className="text-sm text-slate-400 dark:text-slate-500">Catálogo de productos — haz clic para ver detalles</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48 transition-all input-neon" />
          </div>
        </div>
      </motion.div>

      {/* Category filter */}
      <motion.div variants={itemAnim} className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-slate-400 mt-1.5 shrink-0" />
        {categorias.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${catFilter === c ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
            {c}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(p => (
          <motion.div
            key={p.id}
            variants={itemAnim}
            whileHover={{ y: -8, transition: { type: 'spring', stiffness: 200 } }}
            onClick={() => { setSelected(p); setEditMode(false); }}
            className="glass-card-neon rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
          >
            <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <img src={getProductImage(p)} alt={p.nombre}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-3 right-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm ${
                  p.stock > 0 ? 'bg-emerald-500/90 text-white neon-glow-sm' : 'bg-red-500/90 text-white'
                }`}>
                  {p.stock > 0 ? `${p.stock} en stock` : 'Agotado'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{p.nombre}</h3>
              {p.descripcion && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">{p.descripcion}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/30">
                <motion.p
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-lg font-bold text-emerald-600 dark:text-emerald-400"
                >${Number(p.precio).toLocaleString('es-CL')}</motion.p>
                <span className="text-xs text-slate-400 dark:text-slate-500">ID: {p.id}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      )}

      {!loading && filtered.length === 0 && (
        <motion.div variants={itemAnim} className="text-center py-16 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No se encontraron productos</p>
        </motion.div>
      )}

      <DetailModal open={!!selected} onClose={() => { setSelected(null); setEditMode(false); }} title={editMode ? 'Editar Producto' : selected?.nombre} size="max-w-2xl">
        {selected && !editMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner">
              <img src={getProductImage(selected)} alt={selected.nombre}
                className="w-full h-64 object-cover" />
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-bold text-slate-800 dark:text-white">{selected.nombre}</h4>
                {selected.descripcion && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{selected.descripcion}</p>}
              </div>
              <div className="space-y-2">
                {[
                  { icon: DollarSign, label: 'Precio', value: `$${Number(selected.precio).toLocaleString('es-CL')}`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                  { icon: Layers, label: 'Stock', value: `${selected.stock} unidades`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                  { icon: Hash, label: 'ID Producto', value: selected.id, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 ${item.bg} rounded-xl border border-white/50 dark:border-white/5`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{item.label}</p>
                      <p className={`font-bold text-slate-800 dark:text-white text-lg ${item.color}`}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {isAdmin && (
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleEdit(selected)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-all">
                    <Edit3 className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button onClick={() => handleDelete(selected.id)} disabled={deleting === selected.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-all disabled:opacity-50">
                    <Trash2 className="w-3.5 h-3.5" /> {deleting === selected.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {selected && editMode && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nombre</label>
              <input type="text" value={editForm.nombre} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
              <textarea value={editForm.descripcion} onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white resize-none" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Precio</label>
                <input type="number" value={editForm.precio} onChange={e => setEditForm({ ...editForm, precio: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Stock</label>
                <input type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-white" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                Cancelar
              </button>
              <button onClick={handleSaveEdit}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-all">
                <Save className="w-3.5 h-3.5" /> Guardar
              </button>
            </div>
          </div>
        )}
      </DetailModal>
    </motion.div>
  );
}

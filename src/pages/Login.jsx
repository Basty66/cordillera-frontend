import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn, Eye, EyeOff, Hexagon,
  ShieldCheck, ShoppingCart, Package,
  Users, Zap, ArrowRight,
  ChevronRight, Fingerprint, ArrowLeft,
  Store, BarChart3, LineChart
} from 'lucide-react';

const roles = [
  { id: 'admin', user: 'admin', pass: 'admin123', label: 'Administrador', icon: ShieldCheck, color: 'from-violet-500 to-violet-600', desc: 'Control total del sistema' },
  { id: 'ventas', user: 'vendedor', pass: 'ventas123', label: 'Vendedor', icon: ShoppingCart, color: 'from-emerald-500 to-emerald-600', desc: 'Gestión de ventas' },
  { id: 'bodega', user: 'bodega', pass: 'bodega123', label: 'Bodeguero', icon: Package, color: 'from-amber-500 to-amber-600', desc: 'Control de inventario' },
];

function Background() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let w, h, mouse = { x: -999, y: -999 };
    let t = 0;
    let running = true;

    function onMouseMove(e) { mouse.x = e.clientX; mouse.y = e.clientY; }
    function onMouseLeave() { mouse.x = -999; mouse.y = -999; }

    const resize = () => { w = c.width = innerWidth; h = c.height = innerHeight; };
    resize();
    addEventListener('resize', resize);
    addEventListener('mousemove', onMouseMove);
    addEventListener('mouseleave', onMouseLeave);

    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 0.5,
      baseAlpha: Math.random() * 0.5 + 0.3,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseOffset: Math.random() * Math.PI * 2,
      isBright: Math.random() > 0.85,
    }));

    let anim;
    function draw() {
      if (!running) return;
      t += 0.005;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < 4; i++) {
        const cx = w * (0.1 + 0.8 * Math.sin(t * 0.15 + i * 1.5));
        const cy = h * (0.2 + 0.6 * Math.cos(t * 0.12 + i * 1.2));
        const r = w * (0.3 + 0.12 * Math.sin(t * 0.08 + i * 0.7));
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const alpha = 0.04 + 0.02 * Math.sin(t * 0.2 + i);
        const colors = [[16, 185, 129], [59, 130, 246], [139, 92, 246], [16, 185, 129]];
        const c2 = colors[i];
        grad.addColorStop(0, `rgba(${c2[0]},${c2[1]},${c2[2]},${alpha})`);
        grad.addColorStop(1, `rgba(${c2[0]},${c2[1]},${c2[2]},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      particles.forEach(p => {
        p.x += p.vx + (mouse.x !== -999 ? (mouse.x - p.x) * 0.00008 : 0);
        p.y += p.vy + (mouse.y !== -999 ? (mouse.y - p.y) * 0.00008 : 0);
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });

      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.min(w, h) * 0.15;
          if (d < maxDist) {
            const alpha = 0.15 * (1 - d / maxDist) * Math.sin(t + a.pulseOffset) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(16,185,129,${alpha * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      particles.forEach(p => {
        const pulse = Math.sin(t * 3 + p.pulseOffset) * 0.3 + 0.7;
        const alpha = p.baseAlpha * pulse;
        const r = p.isBright ? p.r * 1.5 : p.r;

        if (p.isBright) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
          glow.addColorStop(0, `rgba(16,185,129,${alpha * 0.3})`);
          glow.addColorStop(1, 'rgba(16,185,129,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = p.isBright
          ? `rgba(255,255,255,${alpha * 0.9})`
          : `rgba(16,185,129,${alpha})`;
        ctx.fill();
      });

      if (mouse.x !== -999 && mouse.y !== -999) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
        grad.addColorStop(0, 'rgba(16,185,129,0.06)');
        grad.addColorStop(1, 'rgba(16,185,129,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
        ctx.fill();
      }

      anim = requestAnimationFrame(draw);
    }
    anim = requestAnimationFrame(draw);
    return () => {
      running = false;
      if (anim) cancelAnimationFrame(anim);
      removeEventListener('resize', resize);
      removeEventListener('mousemove', onMouseMove);
      removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />;
}

const stepVariants = {
  enter: (dir) => ({ opacity: 0, y: dir > 0 ? 40 : -40, scale: 0.97 }),
  center: { opacity: 1, y: 0, scale: 1 },
  exit: (dir) => ({ opacity: 0, y: dir > 0 ? -40 : 40, scale: 0.97 }),
};

export default function Login() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [typedUser, setTypedUser] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const passRef = useRef(null);
  const userRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) try { const p = JSON.parse((s=>{try{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(atob(s).split('').map(c=>'%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''))}catch{return atob(s)}})(t.split('.')[1])); if (p.exp * 1000 < Date.now()) throw 'expired'; } catch { localStorage.removeItem('token'); localStorage.removeItem('user'); }
  }, []);
  useEffect(() => { if (isAuthenticated) navigate('/', { replace: true }); }, [isAuthenticated, navigate]);

  const go = (s, d = 1) => { setDir(d); setStep(s); };

  useEffect(() => { if (step === 2) passRef.current?.focus(); }, [step]);
  useEffect(() => { if (step === 1) userRef.current?.focus(); }, [step]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password.trim()) { setError('Ingresa tu contraseña'); return; }
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales inválidas');
    } finally { setLoading(false); }
  };

  const selectRole = useCallback((r) => {
    setSelectedRole(r.id);
    setPassword(r.pass);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (username !== r.user) {
      setUsername(r.user);
      let i = 0;
      setTypedUser('');
      intervalRef.current = setInterval(() => {
        setTypedUser(r.user.slice(0, i + 1));
        i++;
        if (i >= r.user.length) { clearInterval(intervalRef.current); intervalRef.current = null; }
      }, 45);
    }
    timeoutRef.current = setTimeout(() => go(2, 1), 300);
  }, [username]);

  const splashToRoles = () => {
    go(1, 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#070b14]">
      <Background />
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(7,11,20,0.6) 100%)' }} />

      {/* Main card container */}
      <div className="relative w-full max-w-[420px] mx-auto px-4 z-10">
        {/* Glow behind */}
        <div className="absolute -inset-20 bg-gradient-to-b from-emerald-500/8 via-emerald-500/3 to-transparent rounded-[60px] blur-3xl pointer-events-none" />

        {/* Card */}
        <div className="relative bg-[#0c1124]/80 backdrop-blur-2xl rounded-3xl border border-white/[0.06] shadow-2xl p-8 sm:p-10 min-h-[460px] flex flex-col">
          {/* Top logo bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5 mb-8">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
              <Hexagon className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-sm font-bold text-white">Grupo Cordillera</p>
          </motion.div>

          {/* Animated steps */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait" custom={dir}>
              {/* ===== STEP 0: SPLASH ===== */}
              {step === 0 && (
                <motion.div key="splash" custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/25 mb-6"
                  >
                    <Hexagon className="w-10 h-10 text-white" />
                  </motion.div>

                  <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-white tracking-tight"
                  >
                    Plataforma de Monitoreo
                  </motion.h1>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="text-slate-500 text-sm mt-2 max-w-xs"
                  >
                    Gestión inteligente de ventas, sucursales e indicadores económicos para Grupo Cordillera.
                  </motion.p>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 mt-6 mb-8"
                  >
                    {[Store, BarChart3, LineChart].map((Icon, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Icon className="w-3 h-3 text-emerald-500/50" />
                        {['12 Sucursales', '24 KPIs', '1.2K Prod.'][i]}
                        {i < 2 && <span className="text-slate-700 mx-1">·</span>}
                      </div>
                    ))}
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={splashToRoles}
                    className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm"
                  >
                    <Fingerprint className="w-4 h-4" />
                    Iniciar sesión
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}

              {/* ===== STEP 1: ROLE SELECTION ===== */}
              {step === 1 && (
                <motion.div key="roles" custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.button onClick={() => go(0, -1)} whileHover={{ x: -2 }}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Volver
                  </motion.button>

                  <h2 className="text-xl font-bold text-white tracking-tight mb-1">¿Quién eres?</h2>
                  <p className="text-sm text-slate-500 mb-6">Selecciona tu perfil para acceder al sistema</p>

                  <div className="space-y-3">
                    {roles.map((r, i) => (
                      <motion.button key={r.id}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                        whileHover={{ scale: 1.01, x: 4 }} whileTap={{ scale: 0.98 }}
                        onClick={() => selectRole(r)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200 text-left group"
                      >
                        <div className={`w-12 h-12 bg-gradient-to-br ${r.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                          <r.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{r.user}</p>
                          <p className="text-xs text-slate-500">{r.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      </motion.button>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/[0.04]">
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                      onClick={() => { setSelectedRole(null); go(2, 1); }}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-dashed border-white/[0.06] hover:border-white/[0.1] transition-all text-sm text-slate-400 hover:text-white"
                    >
                      <Users className="w-4 h-4" /> Otro usuario
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ===== STEP 2: PASSWORD ===== */}
              {step === 2 && (
                <motion.div key="pass" custom={dir} variants={stepVariants} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.button onClick={() => go(1, -1)} whileHover={{ x: -2 }}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Cambiar usuario
                  </motion.button>

                  <div className="flex items-center gap-3 mb-6">
                    {selectedRole ? (
                      <>
                        <div className={`w-10 h-10 bg-gradient-to-br ${roles.find(r => r.id === selectedRole)?.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          {(() => { const r = roles.find(rr => rr.id === selectedRole); return r ? <r.icon className="w-5 h-5 text-white" /> : <Users className="w-5 h-5 text-white" />; })()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{typedUser || username}</p>
                          <p className="text-xs text-slate-500">{roles.find(r => r.id === selectedRole)?.label}</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                          <Users className="w-5 h-5 text-slate-300" />
                        </div>
                        <div className="flex-1">
                          <input ref={userRef} type="text" value={typedUser || username}
                            onChange={e => { setUsername(e.target.value); setTypedUser(''); }}
                            className="w-full bg-transparent text-sm text-white outline-none placeholder-slate-600 border-b border-white/[0.06] pb-1 focus:border-emerald-500/40 transition-colors"
                            placeholder="Ingresa tu usuario"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="p-2.5 bg-red-500/10 border border-red-500/15 rounded-xl text-xs text-red-400 text-center"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2">Contraseña</label>
                      <div className="relative group">
                        <Zap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                        <input key={selectedRole || 'custom'} ref={passRef} type={showPassword ? 'text' : 'password'} value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full bg-[#070b14] pl-10 pr-10 py-3 text-sm text-white rounded-xl border border-white/[0.06] placeholder-slate-600 outline-none transition-all duration-200 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10"
                          placeholder="Ingresa tu contraseña"
                          autoComplete="new-password"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
                      className="w-full relative flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/15 disabled:opacity-50 text-sm overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      {loading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                          </svg>
                        </motion.div>
                      ) : (<><LogIn className="w-4 h-4" /> Ingresar al panel</>)}
                    </motion.button>

                    <div className="text-center">
                      <button type="button" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom dots */}
          <div className="flex items-center justify-center gap-1.5 mt-6 pt-4 border-t border-white/[0.03]">
            {[0, 1, 2].map((s) => (
              <motion.button key={s} onClick={() => go(s, s > step ? 1 : -1)}
                className={`rounded-full transition-all duration-300 ${step === s ? 'w-6 h-1.5 bg-emerald-500' : 'w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500'}`}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-[9px] text-slate-700/80 mt-5">&copy; 2026 Grupo Cordillera</p>
      </div>
    </div>
  );
}

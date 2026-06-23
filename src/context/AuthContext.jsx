import { createContext, useContext, useState, useMemo } from 'react';
import { login as apiLogin } from '../api/client';

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  try { return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')); }
  catch { return atob(str); }
}

function getStoredToken() {
  const t = localStorage.getItem('token');
  if (!t) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(t.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  } catch { localStorage.removeItem('token'); localStorage.removeItem('user'); return null; }
  return t;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [token, setToken] = useState(() => getStoredToken());

  const login = async (username, password) => {
    const res = await apiLogin(username, password);
    setToken(res.token);
    setUser({ username: res.username, rol: res.rol, nombre: res.nombre });
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify({ username: res.username, rol: res.rol, nombre: res.nombre }));
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const hasRole = (...roles) => user && roles.includes(user.rol);

  const isAuthenticated = useMemo(
    () => !!getStoredToken(),
    [token]
  );

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

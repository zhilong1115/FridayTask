import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  getAuthHeader: () => { 'X-Auth-Token': string } | {};
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = 'http://localhost:4747';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('friday-auth-token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verify token on mount
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/api/auth/verify`, {
        method: 'POST',
        headers: { 'X-Auth-Token': token },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('friday-auth-token');
            setToken(null);
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          setIsAuthenticated(false);
        });
    }
  }, [token]);

  const login = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('friday-auth-token', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    if (token) {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'X-Auth-Token': token },
      });
    }
    localStorage.removeItem('friday-auth-token');
    setToken(null);
    setIsAuthenticated(false);
  };

  const getAuthHeader = () => {
    return token ? { 'X-Auth-Token': token } : {};
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

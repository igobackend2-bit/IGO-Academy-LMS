/**
 * AuthContext — Global authentication state for IGo Academy Platform
 * Manages: current user, login/logout, token refresh, session expiry
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /** Fetch current user profile on mount (validates token) */
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  /**
   * Log in with email + password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setUser(res.data.data.user);
        // Redirect based on role
        const role = res.data.data.user.role;
        navigate(`/${role}/dashboard`);
        return { success: true };
      }
    } catch (err) {
      const errorCode = err.response?.data?.error;
      if (errorCode === 'COURSE_EXPIRED') {
        navigate('/course-expired');
      }
      return { success: false, error: errorCode || 'INVALID_CREDENTIALS' };
    }
  }, [navigate]);

  /**
   * Log out current user
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ } finally {
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isTrainer: user?.role === 'trainer',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to consume auth context
 * @returns {typeof AuthContext extends import('react').Context<infer T> ? T : never}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

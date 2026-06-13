/**
 * ProtectedRoute — Guards routes by authentication and role
 * Redirects unauthenticated users to /login
 * Redirects wrong-role users to their own dashboard
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from './LoadingScreen';

/**
 * @param {{ role: 'admin' | 'trainer' | 'student' }} props
 */
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;

  return <Outlet />;
}

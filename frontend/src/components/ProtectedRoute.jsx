// Bảo vệ route ở phía giao diện (RBAC).
// Dùng: <Route element={<ProtectedRoute roles={['admin']} />}> ...các route con... </Route>
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from './Loading';

export default function ProtectedRoute({ roles }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  const hasRequiredRole = !roles || roles.some((role) => user.roles.includes(role));
  if (!hasRequiredRole) return <Navigate to="/" replace />;

  return <Outlet />;
}

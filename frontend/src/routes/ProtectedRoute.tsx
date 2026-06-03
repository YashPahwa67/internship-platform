import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectIsAuthenticated, selectUser } from '../features/auth/authSlice';

export function ProtectedRoute() {
  const isAuth = useAppSelector(selectIsAuthenticated);
  if (!isAuth) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RoleRoute({ roles }: { roles: string[] }) {
  const user = useAppSelector(selectUser);
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

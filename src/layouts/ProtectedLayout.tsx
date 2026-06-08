// src/layouts/ProtectedLayout.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-4">Checking auth...</div>;
  }

  // ❌ belum login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ sudah login
  return <Outlet />;
}

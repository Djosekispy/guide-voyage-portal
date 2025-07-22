import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  userType?: 'tourist' | 'guide';
}

const ProtectedRoute = ({ children, requireAuth = true, userType }: ProtectedRouteProps) => {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (userType && userData?.userType !== userType) {
    // Redirecionar para dashboard apropriado
    const redirectPath = userData?.userType === 'guide' ? '/guia/dashboard' : '/turista/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
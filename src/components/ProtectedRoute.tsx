import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  userType?: 'tourist' | 'guide' | 'admin';
}

const ProtectedRoute = ({ children, requireAuth = true, userType }: ProtectedRouteProps) => {
  const { user, userData, loading, logout, refreshUserData } = useAuth();
  const navigate = useNavigate();
  // debug logging to help diagnose blank screens or redirect issues
  console.debug('[ProtectedRoute] render', { loading, user: !!user, userData });

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

  // If a user is authenticated but we don't yet have userData (missing Firestore doc),
  // show a loading / informational UI instead of redirecting.
  if (user && userData === null) {
    console.warn('[ProtectedRoute] authenticated user has no userData - uid:', user.uid);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Carregando informações do perfil...</p>
          <p className="text-xs text-muted-foreground mt-1">Se o problema persistir, entre em contato com o suporte.</p>
          <div className="mt-4 flex gap-2 justify-center">
            <Button variant="ghost" onClick={() => navigate('/')}>Voltar</Button>
            <Button variant="outline" onClick={async () => { await refreshUserData?.(); }}>Recarregar perfil</Button>
            <Button variant="destructive" onClick={async () => { await logout(); navigate('/'); }}>Sair</Button>
          </div>
        </div>
      </div>
    );
  }

  if (userType && userData?.userType !== userType) {
    // Redirecionar para dashboard apropriado
    const redirectPath = 
      userData?.userType === 'admin' ? '/admin/dashboard' :
      userData?.userType === 'guide' ? '/guia/dashboard' : 
      '/turista/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
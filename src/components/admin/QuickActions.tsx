import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Package, 
  Bell, 
  CreditCard, 
  Settings, 
  BarChart,
  Wallet
} from 'lucide-react';

interface QuickActionsProps {
  pendingBookings: number;
  unreadNotifications: number;
  pendingWithdrawals: number;
}

export default function QuickActions({ 
  pendingBookings, 
  unreadNotifications, 
  pendingWithdrawals 
}: QuickActionsProps) {
  const navigate = useNavigate();

  const actions = [
    { 
      label: 'Gerenciar Usuários', 
      icon: Users, 
      path: '/admin/usuarios',
      color: 'text-primary'
    },
    { 
      label: 'Gerenciar Guias', 
      icon: Users, 
      path: '/admin/guias',
      color: 'text-primary'
    },
    { 
      label: 'Ver Reservas', 
      icon: Calendar, 
      path: '/admin/reservas',
      badge: pendingBookings > 0 ? pendingBookings : undefined,
      color: 'text-primary'
    },
    { 
      label: 'Ver Pacotes', 
      icon: Package, 
      path: '/admin/pacotes',
      color: 'text-primary'
    },
    { 
      label: 'Destinos', 
      icon: MapPin, 
      path: '/admin/destinos',
      color: 'text-primary'
    },
    { 
      label: 'Notificações', 
      icon: Bell, 
      path: '/admin/notificacoes',
      badge: unreadNotifications > 0 ? unreadNotifications : undefined,
      color: 'text-primary'
    },
    { 
      label: 'Pagamentos', 
      icon: CreditCard, 
      path: '/admin/pagamentos',
      color: 'text-primary'
    },
    { 
      label: 'Saques', 
      icon: Wallet, 
      path: '/admin/saques',
      badge: pendingWithdrawals > 0 ? pendingWithdrawals : undefined,
      color: 'text-primary'
    },
    { 
      label: 'Analytics', 
      icon: BarChart, 
      path: '/admin/analytics',
      color: 'text-primary'
    },
    { 
      label: 'Configurações', 
      icon: Settings, 
      path: '/admin/configuracoes',
      color: 'text-muted-foreground'
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {actions.map(action => (
            <Button
              key={action.path}
              variant="outline"
              className="h-auto flex-col py-4 gap-2 relative"
              onClick={() => navigate(action.path)}
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-xs text-center">{action.label}</span>
              {action.badge && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {action.badge > 99 ? '99+' : action.badge}
                </span>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

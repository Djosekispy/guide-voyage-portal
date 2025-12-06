import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  BookOpen, 
  Settings,
  UserCheck,
  Package,
  Bell,
  CreditCard,
  TrendingUp,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const AdminSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Usuários",
      href: "/admin/usuarios",
      icon: Users,
    },
    {
      name: "Guias",
      href: "/admin/guias",
      icon: UserCheck,
    },
    {
      name: "Pacotes",
      href: "/admin/pacotes",
      icon: Package,
    },
    {
      name: "Reservas",
      href: "/admin/reservas",
      icon: BookOpen,
    },
    {
      name: "Pagamentos",
      href: "/admin/pagamentos",
      icon: CreditCard,
    },
    {
      name: "Saques",
      href: "/admin/saques",
      icon: Wallet,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: TrendingUp,
    },
    {
      name: "Notificações",
      href: "/admin/notificacoes",
      icon: Bell,
    },
    {
      name: "Destinos",
      href: "/admin/destinos",
      icon: MapPin,
    },
    {
      name: "Configurações",
      href: "/admin/configuracoes",
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden lg:block fixed inset-y-0 left-0 z-10 w-64 h-full border-r bg-background mt-16">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Painel Admin</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-lg transition-colors",
                location.pathname === item.href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium">AD</span>
            </div>
            <div>
              <p className="text-sm font-medium">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;

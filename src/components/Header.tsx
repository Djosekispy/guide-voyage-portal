import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, MapPin, User, LogOut, MessageCircle, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const navigate = useNavigate();
  const { user, userData, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigateToDashboard = () => {
    if (userData?.userType === 'admin') {
      navigate('/admin/dashboard');
    } else if (userData?.userType === 'guide') {
      navigate('/guia/dashboard');
    } else {
      navigate('/turista/dashboard');
    }
    setIsMenuOpen(false);
  };

  const navigateToMessages = () => {
    navigate('/mensagens');
    setIsMenuOpen(false);
  };

  const navigateToProfile = () => {
    userData?.userType === 'guide' 
      ? navigate('/guia/EditProfile') 
      : navigate('/turista/EditProfile');
    setIsMenuOpen(false);
  };

  const navItems = [
    { name: "Início", href: "/" },
    { name: "Sobre", href: "/sobre" },
    { name: "Destinos", href: "/destinos" },
    { name: "Guias", href: "/guias" },
    { name: "Blog", href: "/blog" },
    { name: "Contacto", href: "/contato" },
  ];

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <MapPin className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-foreground">Explora Angola</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {userData?.userType === 'admin' && <NotificationBell />}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || ''} alt={userData?.name || ''} />
                        <AvatarFallback>
                          {userData?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{userData?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={navigateToDashboard}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={navigateToProfile}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={navigateToMessages}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>Conversas</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/auth">Criar Conta</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent/50 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || ''} alt={userData?.name || ''} />
                      <AvatarFallback>
                        {userData?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{userData?.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={navigateToDashboard}
                    className="flex items-center px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent/50 rounded w-full text-left"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </button>
                  
                  <button
                    onClick={navigateToProfile}
                    className="flex items-center px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent/50 rounded w-full text-left"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </button>
                  
                  <button
                    onClick={navigateToMessages}
                    className="flex items-center px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent/50 rounded w-full text-left"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Conversas
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent/50 rounded w-full text-left"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-3 pt-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      Entrar
                    </Link>
                  </Button>
                  <Button variant="hero" className="w-full" asChild>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      Criar Conta
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
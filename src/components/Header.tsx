import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass, Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Compass className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-foreground">GuiaViagem</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Início
            </Link>
            <Link to="/destinos" className="text-foreground hover:text-primary transition-colors">
              Destinos
            </Link>
            <Link to="/sobre" className="text-foreground hover:text-primary transition-colors">
              Sobre Nós
            </Link>
            <Link to="/blog" className="text-foreground hover:text-primary transition-colors">
              Blog
            </Link>
            <Link to="/contato" className="text-foreground hover:text-primary transition-colors">
              Contato
            </Link>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/cadastro">Cadastrar</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                Início
              </Link>
              <Link
                to="/destinos"
                className="text-foreground hover:text-primary transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                Destinos
              </Link>
              <Link
                to="/sobre"
                className="text-foreground hover:text-primary transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                Sobre Nós
              </Link>
              <Link
                to="/blog"
                className="text-foreground hover:text-primary transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                Blog
              </Link>
              <Link
                to="/contato"
                className="text-foreground hover:text-primary transition-colors px-2 py-1"
                onClick={toggleMenu}
              >
                Contato
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/login" onClick={toggleMenu}>Entrar</Link>
                </Button>
                <Button variant="hero" asChild className="justify-start">
                  <Link to="/cadastro" onClick={toggleMenu}>Cadastrar</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
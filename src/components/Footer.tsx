import { Link } from "react-router-dom";
import { Compass, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <Compass className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">Turismo Angola</span>
            </Link>
            <p className="text-white/80 mb-6 leading-relaxed">
              Conectamos viajantes com guias locais para experiências autênticas e inesquecíveis ao redor do mundo.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Links Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-white/80 hover:text-primary transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/destinos" className="text-white/80 hover:text-primary transition-colors">
                  Destinos
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-white/80 hover:text-primary transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/80 hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-white/80 hover:text-primary transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Serviços</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/buscar-guias" className="text-white/80 hover:text-primary transition-colors">
                  Buscar Guias
                </Link>
              </li>
              <li>
                <Link to="/tornar-se-guia" className="text-white/80 hover:text-primary transition-colors">
                  Tornar-se Guia
                </Link>
              </li>
              <li>
                <Link to="/passeios-populares" className="text-white/80 hover:text-primary transition-colors">
                  Passeios Populares
                </Link>
              </li>
              <li>
                <Link to="/avaliacoes" className="text-white/80 hover:text-primary transition-colors">
                  Avaliações
                </Link>
              </li>
              <li>
                <Link to="/ajuda" className="text-white/80 hover:text-primary transition-colors">
                  Central de Ajuda
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Contacto</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-white/80">contacto@turismoangola.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-white/80">+244 927023710</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-white/80">Lubango, Angola</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm mb-4 md:mb-0">
             © {new Date().getFullYear()} ExplorAngola. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacidade" className="text-white/60 hover:text-primary text-sm transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/termos" className="text-white/60 hover:text-primary text-sm transition-colors">
                Termos de Uso
              </Link>
              <Link to="/cookies" className="text-white/60 hover:text-primary text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-white flex flex-col">

 <Header />

      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-8 sm:p-10 md:p-12">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Icons.Compass  />
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Ops! 
              </h1>

              <p className="text-lg text-gray-600 mb-2">
               Página Não Encontrada
              </p>

              <p className="text-gray-600 mb-8">
                Parece que você se perdeu em sua jornada. Mas calma, vamos te ajudar a encontrar o caminho!
              </p>

              <div className="space-y-4">
                <Button 
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => navigate("/")}
                >
                  <Icons.Home />
                  Página Inicial
                </Button>

                
              </div>
            </div>
          </div>

          {/* Footer section */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">
                Precisa de ajuda? <a href="/contato" className="font-medium text-sky-600 hover:underline">Contate nosso suporte</a>
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-sky-600 hover:text-sky-800">
                  <Icons.Twitter />
                </a>
                <a href="#" className="text-sky-600 hover:text-sky-800">
                  <Icons.Facebook />
                </a>
                <a href="#" className="text-sky-600 hover:text-sky-800">
                  <Icons.Instagram />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

 <Footer />
    </div>
  );
};

export default NotFound;

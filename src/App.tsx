
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Destinations from "./pages/Destinations";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import GuideDashboard from "./pages/GuideDashboard";
import GuideProfile from "./pages/GuideProfile";
import GuideTours from "./pages/GuideTours";
import GuideBookings from "./pages/GuideBookings";
import GuideCalendar from "./pages/GuideCalendar";
import GuideReviews from "./pages/GuideReviews";
import TouristDashboard from "./pages/TouristDashboard";
import SearchGuides from "./pages/SearchGuides";
import TouristBookings from "./pages/TouristBookings";
import ReviewTour from "./pages/ReviewTour";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/destinos" element={<Destinations />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Guide Panel Routes */}
          <Route path="/guia/dashboard" element={<GuideDashboard />} />
          <Route path="/guia/perfil" element={<GuideProfile />} />
          <Route path="/guia/passeios" element={<GuideTours />} />
          <Route path="/guia/reservas" element={<GuideBookings />} />
          <Route path="/guia/calendario" element={<GuideCalendar />} />
          <Route path="/guia/avaliacoes" element={<GuideReviews />} />
          
          {/* Tourist Panel Routes */}
          <Route path="/turista/dashboard" element={<TouristDashboard />} />
          <Route path="/turista/buscar-guias" element={<SearchGuides />} />
          <Route path="/turista/reservas" element={<TouristBookings />} />
          <Route path="/turista/avaliar" element={<ReviewTour />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import BrowseGuides from "./pages/BrowseGuides";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/destinos" element={<Destinations />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/guias" element={<BrowseGuides />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Guide Panel Routes - Protected */}
            <Route path="/guia/dashboard" element={
              <ProtectedRoute userType="guide">
                <GuideDashboard />
              </ProtectedRoute>
            } />
            <Route path="/guia/perfil" element={
              <ProtectedRoute userType="guide">
                <GuideProfile />
              </ProtectedRoute>
            } />
            <Route path="/guia/passeios" element={
              <ProtectedRoute userType="guide">
                <GuideTours />
              </ProtectedRoute>
            } />
            <Route path="/guia/reservas" element={
              <ProtectedRoute userType="guide">
                <GuideBookings />
              </ProtectedRoute>
            } />
            <Route path="/guia/calendario" element={
              <ProtectedRoute userType="guide">
                <GuideCalendar />
              </ProtectedRoute>
            } />
            <Route path="/guia/avaliacoes" element={
              <ProtectedRoute userType="guide">
                <GuideReviews />
              </ProtectedRoute>
            } />
            
            {/* Tourist Panel Routes - Protected */}
            <Route path="/turista/dashboard" element={
              <ProtectedRoute userType="tourist">
                <TouristDashboard />
              </ProtectedRoute>
            } />
            <Route path="/turista/buscar-guias" element={
              <ProtectedRoute userType="tourist">
                <SearchGuides />
              </ProtectedRoute>
            } />
            <Route path="/turista/reservas" element={
              <ProtectedRoute userType="tourist">
                <TouristBookings />
              </ProtectedRoute>
            } />
            <Route path="/turista/avaliar" element={
              <ProtectedRoute userType="tourist">
                <ReviewTour />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

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
import GuideProfileForm from "./pages/GuideProfileForm";
import FavoritesList from "./pages/Favorite";
import GuidePackagesPage from "./pages/GuidePackagesPage";
import MessagesPage from "./pages/MessagesPage";
import { ChatPage } from "./pages/ChatPage";
import BookingPage from "./pages/BookingPage";
import GuideProfilePage from "./pages/GuideProfileEdit";
import UserProfilePage from "./pages/UserProfilePage";
import GuideClients from "./pages/guideClients";
import GuideBilling from "./pages/GuideBilling";
import GuideMessages from "./pages/GuideMessages";
import GuideSettings from "./pages/GuideSettings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminGuides from "./pages/AdminGuides";
import AdminBookings from "./pages/AdminBookings";
import AdminNotifications from "./pages/AdminNotifications";
import AdminPayments from "./pages/AdminPayments";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminPackages from "./pages/AdminPackages";
import AdminDestinations from "./pages/AdminDestinations";
import AdminSettings from "./pages/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/destinos" element={<Destinations />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/guias" element={<BrowseGuides />} />
            <Route path="/guide-profile-form" element={<GuideProfileForm />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Guide Panel Routes - Protected */}
            <Route path="/guia/dashboard" element={
              <ProtectedRoute userType="guide">
                <GuideDashboard />
              </ProtectedRoute>
            } />

              <Route path="/guia/EditProfile" element={
              <ProtectedRoute userType="guide">
                <GuideProfilePage />
              </ProtectedRoute>
            } />

            <Route path="/guia/perfil" element={
              <ProtectedRoute >
                <GuideProfile />
              </ProtectedRoute>
            } />
            <Route path="/guia/passeios" element={
              <ProtectedRoute userType="guide">
                <GuideTours />
              </ProtectedRoute>
            } />
                    <Route path="/guia/facturamento" element={
              <ProtectedRoute userType="guide">
                <GuideBilling />
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

             <Route path="/guia/clientes" element={
              <ProtectedRoute userType="guide">
                <GuideClients />
              </ProtectedRoute>
            } />
            <Route path="/guia/mensagens" element={
              <ProtectedRoute userType="guide">
                <GuideMessages />
              </ProtectedRoute>
            } />
            <Route path="/guia/definicoes" element={
              <ProtectedRoute userType="guide">
                <GuideSettings />
              </ProtectedRoute>
            } />
            
            {/* Tourist Panel Routes - Protected */}
            <Route path="/turista/dashboard" element={
              <ProtectedRoute userType="tourist">
                <TouristDashboard />
              </ProtectedRoute>
            } />

             <Route path="/turista/EditProfile" element={
              <ProtectedRoute userType="tourist">
                <UserProfilePage />
              </ProtectedRoute>
            } />
             <Route path="/turista/reservas" element={
              <ProtectedRoute userType="tourist">
                <TouristBookings />
              </ProtectedRoute>
            } />
            <Route path="/turista/buscar-guias" element={
              <ProtectedRoute userType="tourist">
                <SearchGuides />
              </ProtectedRoute>
            } />
        
            <Route path="/turista/avaliar" element={
              <ProtectedRoute userType="tourist">
                <ReviewTour />
              </ProtectedRoute>
            } />
            <Route path="/guias/:guideId/pacotes" element={
              <ProtectedRoute userType="tourist">
                <GuidePackagesPage />
              </ProtectedRoute>
            } />

             <Route path="/pacotes/:packageId/reserva" element={
              <ProtectedRoute userType="tourist">
                <BookingPage />
              </ProtectedRoute>
            } />
            <Route path="/meus/favoritos" element={
              <ProtectedRoute userType="tourist">
                <FavoritesList />
              </ProtectedRoute>
            } />

            {/* Sistema de Mensagens - Acessível para ambos (guias e turistas) */}
            <Route path="/mensagens" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }>
              <Route index element={<div className="hidden md:flex md:items-center md:justify-center md:h-full">Selecione uma conversa</div>} />
              <Route path=":conversationId" element={<ChatPage />} />
            </Route>

            {/* Admin Routes - Protected */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute userType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/usuarios" element={
              <ProtectedRoute userType="admin">
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/guias" element={
              <ProtectedRoute userType="admin">
                <AdminGuides />
              </ProtectedRoute>
            } />
            <Route path="/admin/reservas" element={
              <ProtectedRoute userType="admin">
                <AdminBookings />
              </ProtectedRoute>
            } />
            <Route path="/admin/notificacoes" element={
              <ProtectedRoute userType="admin">
                <AdminNotifications />
              </ProtectedRoute>
            } />
            <Route path="/admin/pagamentos" element={
              <ProtectedRoute userType="admin">
                <AdminPayments />
              </ProtectedRoute>
            } />
            <Route path="/admin/saques" element={
              <ProtectedRoute userType="admin">
                <AdminWithdrawals />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute userType="admin">
                <AdminAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/admin/pacotes" element={
              <ProtectedRoute userType="admin">
                <AdminPackages />
              </ProtectedRoute>
            } />
            <Route path="/admin/destinos" element={
              <ProtectedRoute userType="admin">
                <AdminDestinations />
              </ProtectedRoute>
            } />
            <Route path="/admin/configuracoes" element={
              <ProtectedRoute userType="admin">
                <AdminSettings />
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
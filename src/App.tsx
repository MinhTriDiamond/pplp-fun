import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { RequireAuth } from "./components/auth/RequireAuth";
import Index from "./pages/Index";
import Simulator from "./pages/Simulator";
import MintRequests from "./pages/MintRequests";
import ContractDocs from "./pages/ContractDocs";
import Documentation from "./pages/Documentation";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/auth/AuthCallback";
import SetupIdentity from "./pages/auth/SetupIdentity";
import LinkAccounts from "./pages/auth/LinkAccounts";
import ResetPassword from "./pages/auth/ResetPassword";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminEvents from "./pages/admin/Events";
import WalletPage from "./pages/Wallet";
import Treasury from "./pages/Treasury";
import AngelAI from "./pages/AngelAI";
import Academy from "./pages/modules/Academy";
import Play from "./pages/modules/Play";
import Farm from "./pages/modules/Farm";
import Charity from "./pages/modules/Charity";
import Market from "./pages/modules/Market";
import Earth from "./pages/modules/Earth";
import Legal from "./pages/modules/Legal";
import CamlyCoin from "./pages/modules/CamlyCoin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/contract-docs" element={<ContractDocs />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/setup-identity" element={<SetupIdentity />} />
          <Route path="/auth/link-accounts" element={<LinkAccounts />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/simulator" element={<RequireAuth><Simulator /></RequireAuth>} />
          <Route path="/mint-requests" element={<RequireAuth><MintRequests /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/wallet" element={<RequireAuth><WalletPage /></RequireAuth>} />
          <Route path="/treasury" element={<RequireAuth><Treasury /></RequireAuth>} />
          <Route path="/angel" element={<RequireAuth><AngelAI /></RequireAuth>} />
          <Route path="/admin/events" element={<RequireAuth><AdminEvents /></RequireAuth>} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/play" element={<Play />} />
          <Route path="/farm" element={<Farm />} />
          <Route path="/charity" element={<Charity />} />
          <Route path="/market" element={<Market />} />
          <Route path="/earth" element={<Earth />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/camly" element={<CamlyCoin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

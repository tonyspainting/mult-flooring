import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import FloorsPage from "./pages/FloorsPage.tsx";
import CabinetsPage from "./pages/CabinetsPage.tsx";
import ProjectsPage from "./pages/ProjectsPage.tsx";
import ProcessPage from "./pages/ProcessPage.tsx";
import ShowroomPage from "./pages/ShowroomPage.tsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import FlooringPage from "@/pages/FlooringPage";
import { RequestProductProvider } from "@/context/RequestProductContext";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

/**
 * Rotas sem router. Exportado separado para a pré-renderização poder montar
 * com StaticRouter durante o build (scripts/prerender.mjs).
 */
export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/floors" element={<FloorsPage />} />
    <Route path="/flooring" element={<FlooringPage />} />
    <Route path="/cabinets" element={<CabinetsPage />} />
    <Route path="/projects" element={<ProjectsPage />} />
    <Route path="/process" element={<ProcessPage />} />
    <Route path="/showroom" element={<ShowroomPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

/** Providers sem router (usados no cliente e na pré-renderização). */
export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RequestProductProvider>{children}</RequestProductProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

/** Limpa ?redirect=... da URL depois de um 404 em hosts antigos. */
const RedirectCleanup = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect) window.history.replaceState(null, "", redirect);
  }, []);
  return null;
};

const App = () => (
  <AppProviders>
    <BrowserRouter>
      <RedirectCleanup />
      <AppRoutes />
    </BrowserRouter>
  </AppProviders>
);

export default App;

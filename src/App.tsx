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
 * Routes without a router. Exported separately so prerendering can mount
 * them with StaticRouter during the build (scripts/prerender.mjs).
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

/** Providers without a router (used on the client and during prerender). */
export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RequestProductProvider>{children}</RequestProductProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

/** Clears ?redirect=... from the URL after a 404 on legacy hosts. */
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

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
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

const App = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      // Use window.history.replaceState to clean up the URL without a full reload if possible,
      // but since we are at the root, the router will handle the navigation if we tell it to.
      // However, the cleanest way with React Router is often to just navigate or let the 
      // initial route handling logic pick it up if we were to use a more complex state.
      // For now, we'll use history.replaceState to make the URL look correct, 
      // and the router will mount and see the correct path if we are lucky, 
      // or we can manually trigger a navigation.
      window.history.replaceState(null, '', redirect);
    }
  }, []);

  return (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <RequestProductProvider>
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
        </RequestProductProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
  );
};

export default App;

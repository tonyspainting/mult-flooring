import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

/**
 * Public routes ship with prerendered HTML from the build
 * (scripts/prerender.mjs), so Google, Bing, AI crawlers and link previews read
 * the content without running JavaScript.
 *
 * We use createRoot instead of hydrateRoot on purpose: nearly every section
 * uses framer-motion, and its initial styles differ between server and client.
 * Hydration would fail with React error #423 and React would discard the
 * server HTML anyway. Rendering on the client from the start produces the same
 * result without console errors.
 *
 * The SEO benefit comes from the HTML that is served, not from hydration. If
 * the sections ever render identical states on the server, switching to
 * hydrateRoot would also speed up first paint.
 */
createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);

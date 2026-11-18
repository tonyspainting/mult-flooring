import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

/**
 * O HTML das rotas públicas já vem pré-renderizado do build (scripts/prerender.mjs),
 * então Google, Bing, crawlers de IA e prévias de link leem o conteúdo sem
 * executar JavaScript.
 *
 * Aqui usamos createRoot, e não hydrateRoot: a árvore usa framer-motion em
 * praticamente todas as seções, e as animações produzem estilos iniciais que
 * não coincidem entre servidor e cliente — a hidratação falharia e o React
 * descartaria o HTML do servidor de qualquer forma (erro #423). Renderizar no
 * cliente desde o início dá o mesmo resultado, sem erros no console.
 *
 * O ganho de SEO está no HTML servido, não na hidratação. Se um dia as seções
 * passarem a render estados idênticos no servidor, basta trocar por
 * hydrateRoot para aproveitar o HTML também na primeira pintura.
 */
createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);

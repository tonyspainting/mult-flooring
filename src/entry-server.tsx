// Pré-renderização: gera o HTML completo de cada página pública no build,
// para Google, Bing, crawlers de IA e prévias de link lerem o conteúdo sem
// executar JavaScript.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { AppProviders, AppRoutes } from "./App";

export const siteUrl = "https://multflooring.com";

type RouteMeta = { url: string; changefreq: string; priority: string };

/** Páginas públicas, na ordem do sitemap. */
export const sitemapRoutes: RouteMeta[] = [
  { url: "/", changefreq: "weekly", priority: "1.0" },
  { url: "/flooring", changefreq: "weekly", priority: "0.9" },
  { url: "/floors", changefreq: "weekly", priority: "0.9" },
  { url: "/cabinets", changefreq: "weekly", priority: "0.9" },
  { url: "/projects", changefreq: "monthly", priority: "0.8" },
  { url: "/showroom", changefreq: "monthly", priority: "0.8" },
  { url: "/process", changefreq: "monthly", priority: "0.7" },
  { url: "/contact", changefreq: "monthly", priority: "0.8" },
  { url: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
];

export const routes = sitemapRoutes.map((r) => r.url);

export function render(url: string) {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <AppProviders>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </AppProviders>
    </HelmetProvider>,
  );
  const h = helmetContext.helmet;
  const head = h
    ? [h.title.toString(), h.meta.toString(), h.link.toString(), h.script.toString()].join("\n    ")
    : "";
  return { html, head };
}

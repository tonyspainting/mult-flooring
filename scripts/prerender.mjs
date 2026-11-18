// Runs after "vite build": writes a complete index.html for each page into
// dist/ and regenerates the sitemap. If anything fails here the build breaks on
// purpose: failing the deploy beats publishing a site with no content in the HTML.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const serverDir = path.join(root, "dist-server");

const entry = fs.readdirSync(serverDir).find((f) => /^entry-server\.(m?js)$/.test(f));
const { render, routes, sitemapRoutes, siteUrl } = await import(
  pathToFileURL(path.join(serverDir, entry)).href
);

// Tags each page defines itself (via SEO). The generic template version is
// stripped before injecting the route one, to avoid duplicates.
const perPage = [
  /<title>[\s\S]*?<\/title>/i,
  /<meta\s+name="description"[^>]*>/i,
  /<link\s+rel="canonical"[^>]*>/i,
  /<meta\s+name="robots"[^>]*>/gi,
  /<meta\s+property="og:(title|description|url|type|site_name|locale)"[^>]*>/gi,
  /<meta\s+name="twitter:(card|title|description|image)"[^>]*>/gi,
  /<meta\s+property="og:image(:width|:height|:alt)?"[^>]*>/gi,
];

const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

for (const url of routes) {
  const { html, head } = render(url);
  let page = template;
  if (head) {
    for (const re of perPage) page = page.replace(re, "");
    page = page.replace("</head>", `    ${head}\n  </head>`);
  }
  page = page.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  const out = url === "/" ? path.join(dist, "index.html") : path.join(dist, url, "index.html");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, page.replace(/\n\s*\n/g, "\n"));
  console.log("pré-renderizado:", url);
}

// <lastmod> from the last commit date (stable across builds); falls back to
// the build date when .git is not available inside the container.
function sitemapLastmod() {
  try {
    const out = execSync("git log -1 --format=%cs", {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch {
    // no git in the build environment
  }
  return new Date().toISOString().slice(0, 10);
}

const lastmod = sitemapLastmod();

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapRoutes
  .map(
    (r) =>
      `  <url>\n    <loc>${siteUrl}${r.url === "/" ? "/" : r.url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
  )
  .join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);
fs.rmSync(serverDir, { recursive: true, force: true });
console.log(`sitemap.xml with ${sitemapRoutes.length} pages`);

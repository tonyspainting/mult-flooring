import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  /** Aceita caminho relativo ("/contact") ou URL absoluta. */
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  schema?: object;
  noindex?: boolean;
}

const BASE_URL = "https://multflooring.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

/** Normaliza o canonical: aceita "/rota" ou a URL completa e devolve sempre absoluto. */
function absoluteUrl(path?: string): string {
  if (!path) return `${BASE_URL}/`;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export default function SEO({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  keywords,
  schema,
  noindex = false,
}: SEOProps) {
  const fullTitle = title.includes("Mult Flooring")
    ? title
    : `${title} | Mult Flooring`;

  const canonicalUrl = absoluteUrl(canonical);
  const imageUrl = absoluteUrl(ogImage);

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}
      />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content="Mult Flooring" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}

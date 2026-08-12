/**
 * SEO — per-route title/meta/canonical/OG/Twitter tags + optional JSON-LD.
 * Overrides the static defaults baked into client/index.html.
 */
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://igoacademy.in';

export default function SEO({ title, description, path = '/', jsonLd = [] }) {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />

      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

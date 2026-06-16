/**
 * Server-rendered JSON-LD. Emits a <script type="application/ld+json"> so search
 * engines get structured data in the initial HTML (no client JS needed).
 */
export const JsonLd = ({ data }: { data: object | object[] }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
);

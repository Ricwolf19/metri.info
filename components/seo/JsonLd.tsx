/**
 * Server-rendered JSON-LD. Emits structured data into the initial HTML so search
 * engines get it with no client JS.
 *
 * One `<script>` PER node, never a single array. A bare `[{...},{...}]` is valid
 * JSON-LD, but the usual consumer shape — `JSON.parse(el.textContent)["@context"]`
 * — reads `undefined` on an array and throws, which is what page-scanning browser
 * extensions do on our pages. One node per script keeps `@context` a string for
 * every reader while leaving the emitted nodes semantically identical.
 */

/**
 * A `</script>` inside any string value would end the block early. Script content
 * is raw text, so HTML entities would NOT be decoded here — escaping `<` as a JSON
 * unicode escape is what both keeps the block intact and still parses back to `<`.
 */
const serialize = (node: object): string =>
  JSON.stringify(node).replaceAll("<", "\\u003c");

export const JsonLd = ({ data }: { data: object | object[] }) => (
  <>
    {(Array.isArray(data) ? data : [data]).map((node, i) => (
      <script
        key={`${(node as { "@type"?: string })["@type"] ?? "node"}-${i}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serialize(node) }}
      />
    ))}
  </>
);

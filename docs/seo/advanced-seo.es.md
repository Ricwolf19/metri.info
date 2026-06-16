# Manual de SEO avanzado (Next.js App Router)

> Un manual de SEO reutilizable e independiente del proyecto para el App Router
> de Next.js. Objetivo: posicionar para búsquedas competitivas de alta intención
> (en cualquier nicho) en **varios idiomas**, con excelentes Core Web Vitals.

**Contenido**

- [1. Filosofía — SEO "servidor primero"](#1-filosofía--seo-servidor-primero)
- [2. Internacionalización y rutas](#2-internacionalización-y-rutas)
- [3. Estrategia de metadatos](#3-estrategia-de-metadatos)
- [4. Activos SEO basados en archivos](#4-activos-seo-basados-en-archivos)
- [5. Datos estructurados (JSON-LD)](#5-datos-estructurados-json-ld)
- [6. Imágenes Open Graph dinámicas](#6-imágenes-open-graph-dinámicas)
- [7. SEO programático (las páginas clave)](#7-seo-programático-las-páginas-clave)
- [8. Core Web Vitals](#8-core-web-vitals)
- [9. Medición y analítica](#9-medición-y-analítica)
- [Contenido y elementos de confianza por tipo de página](#contenido-y-elementos-de-confianza-por-tipo-de-página)
- [10. Checklist previo al lanzamiento](#10-checklist-previo-al-lanzamiento)
- [11. Referencia de conceptos — qué es / qué brinda / en qué afecta / código](#11-referencia-de-conceptos--qué-es--qué-brinda--en-qué-afecta--código)
- [12. Lecturas recomendadas — fuentes autorizadas](#12-lecturas-recomendadas--fuentes-autorizadas)

---

## 1. Filosofía — SEO "servidor primero"

Los buscadores indexan el **HTML que devuelve el servidor**. Lo que se renderiza
solo con JS en el cliente se indexa de forma poco fiable. La regla:

> **Si un componente puede ser Server Component, lo es.** La interactividad vive
> en pequeñas "islas" cliente; todo lo relevante para SEO (encabezados, texto,
> enlaces, metadatos, datos estructurados) se renderiza en el servidor.

En concreto:

- Las páginas se **generan estáticamente** (SSG) siempre que se puede — TTFB
  instantáneo en el edge y HTML completo para los crawlers.
- Cualquier widget interactivo es una pequeña isla `"use client"` dentro de una
  página estática. Una calculadora es un ejemplo; el mismo patrón aplica a un
  configurador de producto, un formulario de reserva, un mapa, un control de
  precios — cualquier cosa que necesite el navegador.
- La página estática lleva el H1, el contenido explicativo, las FAQ, las
  migas (breadcrumbs) y el JSON-LD — eso es lo que posiciona.

Por este principio una página con contenido supera a un simple widget
incrustado.

---

## 2. Internacionalización y rutas

### La decisión

- **Inglés en la raíz**: `https://example.com/tools/ffmi-calculator`
- **Español bajo `/es` con slugs localizados**:
  `https://example.com/es/herramientas/calculadora-ffmi`

¿Por qué slugs localizados (y no `/es/tools/ffmi-calculator`)? Los resultados en
español premian la keyword en la URL: los competidores reales posicionan
`…/salud/calculadora-ffmi` y `…/calculadora/ffmi`. La keyword en la ruta es señal
de posicionamiento y de CTR.

### Implementación

Dos árboles de rutas explícitos que **comparten componentes**:

```
app/(site)/tools/ffmi-calculator/page.tsx          → EN
app/es/herramientas/calculadora-ffmi/page.tsx      → ES
```

Cada página es un envoltorio fino que renderiza el mismo componente compartido
con una prop `locale` y contenido por idioma. No hace falta un segmento dinámico
`[locale]` porque los segmentos de ruta ya difieren por idioma — y así cada
página queda **100% estática y sin middleware**.

Un único **mapa de rutas** (`lib/i18n/routes.ts`) es la fuente de verdad que
empareja las URLs EN y ES de cada página. Alimenta: el selector de idioma, los
`hreflang` y el sitemap. Nunca codifiques a mano la URL del idioma hermano.

### hreflang (crítico)

Cada página declara alternativas recíprocas + `x-default`:

```ts
export const metadata = {
  alternates: {
    canonical: "/es/herramientas/calculadora-ffmi",
    languages: {
      en: "/tools/ffmi-calculator",
      es: "/es/herramientas/calculadora-ffmi",
      "x-default": "/tools/ffmi-calculator",
    },
  },
};
```

Reglas: las alternativas deben ser **recíprocas** (la página ES apunta a la EN),
usar códigos de idioma reales (`en`, `es`) e incluir siempre `x-default`.

---

## 3. Estrategia de metadatos

### Estáticos (raíz `app/layout.tsx`)

Se definen una vez y los heredan todas las páginas: `metadataBase` (obligatorio
para que las URLs relativas de OG/canonical se resuelvan a absolutas), plantilla
de título (`%s · Brand`), descripción por defecto, Open Graph, Twitter card,
robots, `appleWebApp`, `category`.

### Dinámicos (por página)

Usa `generateMetadata` cuando el título/descripción/canonical varíe:

```ts
export const generateMetadata = async ({ params }): Promise<Metadata> => {
  const calc = getCalculator(params.slug);
  return {
    title: calc.seoTitle,
    description: calc.seoDescription,
    alternates: { canonical: calc.path, languages: calc.alternates },
    openGraph: {
      title: calc.seoTitle,
      images: [`${calc.path}/opengraph-image`],
    },
  };
};
```

### Orden de resolución

Los segmentos más profundos sobrescriben a los superiores; los objetos se
**fusionan** (no campo a campo en profundidad), así que vuelve a declarar los
campos anidados que quieras conservar. La `title.template` de la raíz se aplica
sola a los `title` hijos.

### Anti-patrones

- ❌ Títulos > ~60 caracteres o descripciones > ~160 (se truncan en los SERPs).
- ❌ URLs de imagen OG relativas sin `metadataBase`.
- ❌ Dejar `noindex` por error en una página de producción.
- ❌ Títulos duplicados entre páginas de calculadoras.

---

## 4. Activos SEO basados en archivos

Next App Router los genera desde archivos TypeScript:

- **`app/sitemap.ts`** → `/sitemap.xml`. Generado desde el mapa de rutas + las
  fuentes de contenido (docs, ejercicios). Cada URL lleva `lastModified`,
  `changeFrequency`, `priority` y **`alternates.languages` por URL** para
  hreflang. Las calculadoras llevan la prioridad más alta (0.9–1.0).
- **`app/robots.ts`** → `/robots.txt`. Permite todo lo indexable, bloquea
  `/api/`, rutas internas/auth y las URLs de resultado con `?`; apunta al sitemap.
- **`app/manifest.ts`** → `/manifest.webmanifest`. Nombre PWA, iconos, color.

---

## 5. Datos estructurados (JSON-LD)

Emite JSON-LD en el servidor con `<script type="application/ld+json">` (un
pequeño componente `<JsonLd>`). Ajusta el tipo a la página:

| Página                    | Schema                                                                |
| ------------------------- | --------------------------------------------------------------------- |
| Inicio                    | `Organization` + `WebSite` (con `SearchAction` para caja de búsqueda) |
| Calculadora               | `SoftwareApplication`/`WebApplication` + `FAQPage` + `BreadcrumbList` |
| Calculadora de salud      | además `MedicalWebPage` + fuentes citadas (confianza YMYL)            |
| Artículo de docs          | `Article` (o `MedicalWebPage`) + `BreadcrumbList`                     |
| Cualquier página profunda | `BreadcrumbList`                                                      |

`FAQPage` es el de mayor impacto para calculadoras — gana espacio extra en el
SERP. **Marca solo contenido realmente visible** en la página, o es una
infracción.

E-E-A-T / YMYL: las páginas que pueden afectar la salud, las finanzas o la
seguridad de una persona (calculadoras de salud/fitness, herramientas
financieras, consejo legal/médico) son contenido "Your Money or Your Life".
Google exige señales de confianza para posicionarlas: un autor/revisor real con
nombre, una página "Acerca de", **fuentes autorizadas citadas**, fecha de
"última revisión" y un aviso (disclaimer). Constrúyelo desde el inicio.

---

## 6. Imágenes Open Graph dinámicas

Usa la convención `opengraph-image.tsx` por ruta con `ImageResponse` (runtime
Edge). Una plantilla genera una tarjeta de marca 1200×630 por calculadora/
artículo (nombre + lema + logo). Define `alt`, `size`, `contentType`. Hace que
cada enlace compartido luzca intencional — palanca real de CTR en redes y en
algunas funciones del SERP.

---

## 7. SEO programático (las páginas clave)

El patrón: generar una página enfocada por keyword objetivo, con la keyword como
slug, desde una sola plantilla alimentada por datos estructurados. Así se compite
a escala por una familia de búsquedas relacionadas — sea cual sea el nicho.

**Una página por entidad, la keyword como slug.** Cada página renderiza, en
HTML estático:

1. **H1** = la keyword.
2. El **widget interactivo** (isla cliente) — la calculadora, el configurador,
   el formulario de reserva, etc.
3. **"Cómo funciona"** — el método/fórmula real, explicado con claridad.
4. **"Cómo interpretar tu resultado"** — rangos/categorías/siguientes pasos.
5. **FAQ** (genera resultados enriquecidos `FAQPage`).
6. **Relacionadas** — páginas + enlaces a la base de conocimiento (clúster).

~600–900 palabras de contenido útil por página. Multilingüe (p. ej. EN + slugs
localizados ES).

**URLs de resultado compartibles**: las entradas van en query params
(`?w=80&h=180`) para poder enlazarlas, pero esas URLs son `robots: noindex` con
`canonical` al slug limpio — sin contenido fino/duplicado.

**Ejemplo: un sitio de calculadoras** (EN en raíz / ES localizado). El mismo
enfoque de mapa de slugs sirve para páginas de producto, ubicaciones o cualquier
otro conjunto de entidades:

| Calculadora      | EN                               | ES                                            |
| ---------------- | -------------------------------- | --------------------------------------------- |
| FFMI             | `/tools/ffmi-calculator`         | `/es/herramientas/calculadora-ffmi`           |
| 1RM              | `/tools/1rm-calculator`          | `/es/herramientas/calculadora-1rm`            |
| TDEE/TMB         | `/tools/tdee-calculator`         | `/es/herramientas/calculadora-tdee`           |
| Macros           | `/tools/macro-calculator`        | `/es/herramientas/calculadora-macros`         |
| Grasa corporal   | `/tools/body-fat-calculator`     | `/es/herramientas/calculadora-grasa-corporal` |
| IMC / peso ideal | `/tools/bmi-calculator`          | `/es/herramientas/calculadora-imc`            |
| Hidratación      | `/tools/water-intake-calculator` | `/es/herramientas/calculadora-agua`           |
| Discos           | `/tools/plate-calculator`        | `/es/herramientas/calculadora-discos`         |

(Competir con los grandes agregadores de calculadoras es cuestión de mejor
profundidad de contenido + señales de confianza + Core Web Vitals en cada una de
estas páginas.)

---

## 8. Core Web Vitals

El posicionamiento se ve influido por los CWV de campo. Objetivos:

| Métrica | Objetivo | Cómo lo logramos                                               |
| ------- | -------- | -------------------------------------------------------------- |
| LCP     | < 2.5s   | SSG + edge, `next/font` (sin saltos), imagen hero priorizada   |
| CLS     | < 0.1    | `display: swap` + métricas de fallback; medidas fijas en media |
| INP     | < 200ms  | islas cliente diminutas; diferir JS no crítico                 |
| TTFB    | < 600ms  | páginas estáticas servidas desde el edge/CDN                   |

Práctico: `next/image` para toda imagen, `next/font` para fuentes auto-alojadas
con variables CSS (sin saltos de layout), carga diferida de componentes pesados
bajo el pliegue.

---

## 9. Medición y analítica

Un cableado típico:

- **Vercel Analytics** (`@vercel/analytics`) — vistas/eventos respetuosos con la
  privacidad, sin banner de cookies, cero configuración en Vercel.
- **Vercel Speed Insights** (`@vercel/speed-insights`) — Core Web Vitals de
  **usuarios reales** (los datos de campo que Google usa). Este es el relevante
  para SEO.
- **Google Analytics 4** (`@next/third-parties` `GoogleAnalytics`) — activado por
  `NEXT_PUBLIC_GA_ID`. Apagado hasta que pongas la variable.

Configurar GA4: analytics.google.com → crea una propiedad → añade un flujo de
datos **Web** para `your-domain.com` → copia el **Measurement ID**
(`G-XXXXXXXXXX`) → ponlo en `NEXT_PUBLIC_GA_ID` en las variables de tu hosting.
Listo; el componente carga gtag.

**Google Search Console** (hazlo primero, es la herramienta SEO más importante):

- Añade `your-domain.com` como propiedad; verifica por TXT de DNS (o la meta
  `verification.google`, soportada por los metadatos raíz).
- Envía `https://your-domain.com/sitemap.xml`.
- Vigila: Rendimiento (consultas/impresiones/CTR/posición), Páginas (cobertura de
  indexación) y los informes de Resultados enriquecidos (FAQ/Breadcrumb).

"Panel de métricas en la app" (opcional): GA4 tiene Data API y Search
Console tiene API — una ruta de servidor puede consumir ambas y renderizar un
dashboard interno.

> **Más a fondo:** la analítica de producto (PostHog), la división lectura/
> escritura de GA4, el reverse proxy `/ingest`, los funnels en HogQL y el caché
> del dashboard tienen su propia guía independiente del proyecto →
> [`analytics.es.md`](./analytics.es.md).

---

## Contenido y elementos de confianza por tipo de página

Cada tipo de página posiciona con señales distintas. Ajusta el contenido, los
datos estructurados y los elementos de confianza a _para qué_ sirve la página:

| Tipo de página                  | H1 / estructura de encabezados                                 | ¿FAQ?         | Autor / citas / última revisión / disclaimer (YMYL)      | JSON-LD más adecuado                                              | Nota hreflang                                            |
| ------------------------------- | -------------------------------------------------------------- | ------------- | -------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| Inicio                          | H1 de marca/valor, luego H2 por sección                        | Opcional      | No                                                       | `Organization` + `WebSite` (+ `SearchAction`)                    | `x-default` → inicio en idioma principal                |
| Blog / Artículo                 | Titular como H1, esquema H2/H3 del argumento                   | Opcional      | Firma de autor + fechas; citas si es factual             | `Article` (o `NewsArticle`/`BlogPosting`) + `BreadcrumbList`     | Traduce el slug; alternativas recíprocas por artículo   |
| Producto / E-commerce           | Nombre del producto H1, H2 para specs/reseñas                  | A menudo (Q\&A) | Reseñas/ratings, no autor                                | `Product` (+ `Offer`, `AggregateRating`) + `BreadcrumbList`      | Precio/moneda por locale; alternativas por producto     |
| SaaS / landing                  | H1 orientado al resultado, H2 por feature/beneficio            | Recomendado   | Opcional; los testimonios dan confianza                  | `SoftwareApplication` + `FAQPage` + `BreadcrumbList`            | Landing localizada por mercado                          |
| Herramienta/calc salud/finanzas (YMYL) | H1 keyword, H2 para método + interpretación + FAQ      | **Sí**        | **Obligatorio** (revisor con nombre, fuentes, fecha, disclaimer) | `SoftwareApplication`/`WebApplication` + `MedicalWebPage` + `FAQPage` + `BreadcrumbList` | Slug localizado; alternativas recíprocas                |
| Negocio de servicios local      | "{Servicio} en {Ciudad}" H1, H2 para servicios/zonas/reseñas   | **Sí**        | Reseñas + NAP, no citas académicas                       | `LocalBusiness` (+ `Service`, `AggregateRating`) + `FAQPage`    | Una página por ciudad/locale; alternativas si es multilingüe |
| Sitio multilingüe               | Mismo esquema por idioma; nunca mezclar idiomas en una URL     | Espeja EN/ES  | Espeja por idioma                                        | Mismo tipo por locale, valores traducidos                       | **`hreflang` recíproco + `x-default` en cada página**   |

Las páginas YMYL (salud, finanzas, legal) **requieren** un autor/revisor con
nombre, fuentes autorizadas citadas, fecha de última revisión y un disclaimer
para posicionar siquiera — la confianza es la puerta de entrada, no un extra. Las
páginas informativas y locales, en cambio, se apoyan en el **NAP** (nombre,
dirección, teléfono), un perfil `LocalBusiness` y reseñas genuinas; una empresa
de fumigación/control de plagas, por ejemplo, posiciona por un NAP consistente,
zonas de servicio y valoraciones mucho más que por citas académicas.

---

## 10. Checklist previo al lanzamiento

- [ ] `metadataBase` definido; cada página con título + descripción únicos.
- [ ] Canonical en cada página; URLs de resultado `?param` con `noindex` +
      canonical.
- [ ] hreflang recíproco (en ↔ es) + `x-default` en cada página traducida.
- [ ] `sitemap.xml` con todas las calculadoras/docs y hreflang; `robots.txt` ok.
- [ ] JSON-LD válido (Organization, por calculadora SoftwareApplication + FAQ +
      Breadcrumb). Validado en el Test de Resultados Enriquecidos.
- [ ] La imagen OG se genera para cada tipo de página.
- [ ] Lighthouse ≥ 95 (Rendimiento/SEO/Buenas prácticas/Accesibilidad).
- [ ] HTML semántico: un solo `<h1>`, orden lógico de encabezados,
      `<nav>/<main>/<footer>`, textos alt, navegación por teclado.
- [ ] Search Console verificado + sitemap enviado.
- [ ] Analítica recibiendo datos (Vercel + GA4 si está activo).

## Herramientas de prueba

- **Test de Resultados Enriquecidos** de Google (JSON-LD), **Inspección de URLs**
  (Search Console).
- **PageSpeed Insights** / Lighthouse (CWV, lab + campo).
- **Validador de Schema** (schema.org).
- Verificadores de `hreflang`; `site:your-domain.com` para vigilar la indexación.

---

## 11. Referencia de conceptos — qué es / qué brinda / en qué afecta / código

Cada concepto en un solo lugar: **qué** es, **qué** te brinda, **en qué** afecta y
el **código** mínimo correcto. Independiente del proyecto.

### URL canónica

- **Qué:** la única URL "oficial" de un contenido.
- **Brinda:** consolida duplicados (params, variantes `www`/slash final).
- **Afecta:** evita la dilución por contenido duplicado; concentra señales de ranking.

```ts
export const metadata = { alternates: { canonical: "/tools/ffmi-calculator" } };
```

### hreflang + x-default

- **Qué:** declara las variantes de idioma/región de una página.
- **Brinda:** Google sirve el idioma correcto; evita que EN/ES compitan.
- **Afecta:** ranking internacional + CTR. Debe ser **recíproco**.

```ts
alternates: {
  canonical: "/tools/ffmi-calculator",
  languages: {
    en: "/tools/ffmi-calculator",
    es: "/es/herramientas/calculadora-ffmi",
    "x-default": "/tools/ffmi-calculator",
  },
}
```

### metadataBase

- **Qué:** la URL base absoluta para resolver metadatos relativos.
- **Brinda:** URLs OG/canónicas absolutas correctas.
- **Afecta:** previews sociales rotos si falta.

```ts
export const metadata = { metadataBase: new URL("https://example.com") };
```

### Título y descripción

- **Qué:** el titular del SERP + el snippet.
- **Brinda:** relevancia por keyword + clics.
- **Afecta:** ranking (título) y CTR (ambos). Máx. ~60 / ~160 caracteres; únicos.

```ts
export const metadata = {
  title: { default: "Example", template: "%s · Example" },
  description: "Una frase clara con la keyword principal.",
};
```

### robots / noindex

- **Qué:** directivas de indexación por página.
- **Brinda:** mantiene fuera del índice URLs thin/duplicadas/con params.
- **Afecta:** higiene del índice; un `noindex` accidental en prod hunde el tráfico.

```ts
// página de resultado ?param compartible — no indexar, canónica al slug limpio:
export const metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: "/tools/ffmi-calculator" },
};
```

### Sitemap y robots.txt

- **Qué:** lista para máquinas de URLs indexables + reglas de rastreo.
- **Brinda:** descubrimiento más rápido y completo; hreflang por URL.
- **Afecta:** cobertura y frescura del rastreo.

```ts
// app/sitemap.ts
export default function sitemap() {
  return ROUTES.map((r) => ({
    url: abs(r.en),
    lastModified: new Date(),
    alternates: { languages: { en: abs(r.en), es: abs(r.es) } },
    priority: r.isCalculator ? 0.9 : 0.6,
  }));
}
```

### Datos estructurados (JSON-LD)

- **Qué:** descripción legible por máquinas de la página (schema.org).
- **Brinda:** resultados enriquecidos (FAQ, breadcrumbs, ratings) — más espacio en SERP.
- **Afecta:** CTR fuertemente; marca solo contenido **visible**.

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a } })),
}) }} />
```

### Imagen Open Graph

- **Qué:** la tarjeta de preview al compartir un enlace.
- **Brinda:** previews sociales/SERP intencionales y con marca.
- **Afecta:** CTR en redes y en algunas features del SERP.

```tsx
// app/tools/[calc]/opengraph-image.tsx
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() { return new ImageResponse(<Card/>, size); }
```

### HTML semántico y encabezados

- **Qué:** un `<h1>`, encabezados ordenados, `<nav>/<main>/<footer>`, alt text.
- **Brinda:** estructura clara para crawlers + accesibilidad.
- **Afecta:** comprensión, score de a11y, elegibilidad para featured snippet.

### Enlazado interno / clusters temáticos

- **Qué:** páginas relacionadas se enlazan entre sí alrededor de un tema.
- **Brinda:** reparte link equity; señala autoridad temática.
- **Afecta:** ranking de todo el cluster, no solo de una página.

### Renderizado servidor-primero (SSG/RSC)

- **Qué:** entregar HTML completo desde el servidor; JS solo para islas pequeñas.
- **Brinda:** indexación fiable + TTFB/LCP rápidos.
- **Afecta:** tanto la calidad de indexación como los Core Web Vitals.

### Core Web Vitals

- **Qué:** LCP < 2.5s, CLS < 0.1, INP < 200ms (datos de campo).
- **Brinda:** mejor UX y una señal de ranking.
- **Afecta:** ranking (desempate) y rebote. Mídelos con Speed Insights.

> Para la analítica que mide todo lo anterior, ver
> [`analytics.es.md`](./analytics.es.md).

---

## 12. Lecturas recomendadas — fuentes autorizadas

Tenlas a mano; son las referencias **canónicas y siempre actuales**. Cuando un
consejo de SEO entre en conflicto, estas mandan.

- **[Guía de inicio de SEO de Google](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)**
  — los fundamentos oficiales de Google: cómo Search descubre, rastrea y rankea
  páginas, y las prácticas que el propio Google recomienda. La referencia de
  "¿mi sitio hace bien lo básico?". (Parte de **Google Search Central**, la
  documentación de SEO para desarrolladores.)
- **[Search Console — informe de Rendimiento](https://search.google.com/search-console/performance/)**
  — los datos de búsqueda **reales** de tu sitio: las consultas en las que
  apareces, impresiones, clics, CTR y posición media. Es el bucle de
  retroalimentación empírico — te dice qué keywords posicionan de verdad, en
  vez de adivinar.
- **[schema.org](https://schema.org)** — el vocabulario de datos estructurados:
  cada tipo y propiedad que puedes poner en JSON-LD (`Article`, `FAQPage`,
  `BreadcrumbList`, `MedicalWebPage`, `Product`, `LocalBusiness`, …). El
  diccionario detrás de la sección 5. Combínalo con el **Test de Resultados
  Enriquecidos** de Google para validar.
- **[Search Quality Rater Guidelines (PDF)](https://services.google.com/fh/files/misc/hsw-sqrg.pdf)**
  — el manual que usan los evaluadores humanos de calidad de Google. Define
  **E-E-A-T** (Experiencia, Pericia, Autoridad, Confianza), **YMYL** (Your Money
  or Your Life), "Page Quality" y "Needs Met". La explicación autorizada de qué
  entiende Google por "calidad" — esencial para páginas de salud/finanzas/legal.

Referencias de apoyo ya usadas a lo largo de esta guía: **web.dev** (Core Web
Vitals), **MDN** (HTML semántico) y las herramientas **PageSpeed Insights** /
**Test de Resultados Enriquecidos** de la sección "Herramientas de prueba".

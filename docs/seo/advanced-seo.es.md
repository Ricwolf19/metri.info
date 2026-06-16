# Manual de SEO avanzado (Next.js App Router)

> Este es el estándar de SEO de Metri y una plantilla para futuros proyectos.
> Objetivo: posicionar para búsquedas competitivas de alta intención (p. ej.
> `calculadora ffmi`, `calculadora tdee`) en **inglés y español**, con
> excelentes Core Web Vitals.

---

## 1. Filosofía — SEO "servidor primero"

Los buscadores indexan el **HTML que devuelve el servidor**. Lo que se renderiza
solo con JS en el cliente se indexa de forma poco fiable. La regla:

> **Si un componente puede ser Server Component, lo es.** La interactividad vive
> en pequeñas "islas" cliente; todo lo relevante para SEO (encabezados, texto,
> enlaces, metadatos, datos estructurados) se renderiza en el servidor.

En este repo:

- Las páginas se **generan estáticamente** (SSG) siempre que se puede — TTFB
  instantáneo en el edge y HTML completo para los crawlers.
- Una calculadora es una pequeña isla `"use client"` dentro de una página
  estática.
- La página estática lleva el H1, el contenido explicativo, las FAQ, las
  migas (breadcrumbs) y el JSON-LD — eso es lo que posiciona.

Por este principio una página de calculadora con contenido supera a un simple
widget incrustado.

---

## 2. Internacionalización y rutas

### La decisión

- **Inglés en la raíz**: `https://metri.info/tools/ffmi-calculator`
- **Español bajo `/es` con slugs localizados**:
  `https://metri.info/es/herramientas/calculadora-ffmi`

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
de título (`%s · Metri`), descripción por defecto, Open Graph, Twitter card,
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

E-E-A-T / YMYL: las calculadoras de fitness y salud son contenido "Your Money or
Your Life". Google exige señales de confianza para posicionarlas: un autor real,
una página "Acerca de", **fuentes científicas citadas**, fecha de "última
revisión" y un aviso médico. Constrúyelo desde el inicio.

---

## 6. Imágenes Open Graph dinámicas

Usa la convención `opengraph-image.tsx` por ruta con `ImageResponse` (runtime
Edge). Una plantilla genera una tarjeta de marca 1200×630 por calculadora/
artículo (nombre + lema + logo). Define `alt`, `size`, `contentType`. Hace que
cada enlace compartido luzca intencional — palanca real de CTR en redes y en
algunas funciones del SERP.

---

## 7. SEO programático de calculadoras (las páginas clave)

Así competimos con omnicalculator/ffmicalculator.org.

**Una página por calculadora, la keyword como slug.** Cada página renderiza, en
HTML estático:

1. **H1** = la keyword ("Calculadora FFMI").
2. La **calculadora interactiva** (isla cliente).
3. **"Cómo se calcula"** — la fórmula real, explicada con claridad.
4. **"Cómo interpretar tu resultado"** — rangos/categorías.
5. **FAQ** (genera resultados enriquecidos `FAQPage`).
6. **Relacionadas** — calculadoras + enlaces a la base de conocimiento (clúster).

~600–900 palabras de contenido útil por página. Bilingüe (EN + slugs localizados
ES).

**URLs de resultado compartibles**: las entradas van en query params
(`?w=80&h=180`) para poder enlazarlas, pero esas URLs son `robots: noindex` con
`canonical` al slug limpio — sin contenido fino/duplicado.

**Mapa de slugs** (EN en raíz / ES localizado):

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

---

## 8. Core Web Vitals

El posicionamiento se ve influido por los CWV de campo. Objetivos:

| Métrica | Objetivo | Cómo lo logramos                                               |
| ------- | -------- | -------------------------------------------------------------- |
| LCP     | < 2.5s   | SSG + edge, `next/font` (sin saltos), imagen hero priorizada   |
| CLS     | < 0.1    | `display: swap` + métricas de fallback; medidas fijas en media |
| INP     | < 200ms  | islas cliente diminutas; diferir JS no crítico                 |
| TTFB    | < 600ms  | páginas estáticas servidas desde el edge/CDN                   |

Práctico: `next/image` para toda imagen, `next/font` (ya cableado: Spline Sans +
JetBrains Mono con variables CSS), carga diferida de componentes pesados bajo el
pliegue.

---

## 9. Medición y analítica

Lo que ya está cableado en este repo:

- **Vercel Analytics** (`@vercel/analytics`) — vistas/eventos respetuosos con la
  privacidad, sin banner de cookies, cero configuración en Vercel.
- **Vercel Speed Insights** (`@vercel/speed-insights`) — Core Web Vitals de
  **usuarios reales** (los datos de campo que Google usa). Este es el relevante
  para SEO.
- **Google Analytics 4** (`@next/third-parties` `GoogleAnalytics`) — activado por
  `NEXT_PUBLIC_GA_ID`. Apagado hasta que pongas la variable.

Configurar GA4: analytics.google.com → crea una propiedad → añade un flujo de
datos **Web** para `metri.info` → copia el **Measurement ID** (`G-XXXXXXXXXX`) →
ponlo en `NEXT_PUBLIC_GA_ID` en las variables de Vercel. Listo; el componente
carga gtag.

**Google Search Console** (hazlo primero, es la herramienta SEO más importante):

- Añade `metri.info` como propiedad; verifica por TXT de DNS (o la meta
  `verification.google`, soportada por nuestros metadatos raíz).
- Envía `https://metri.info/sitemap.xml`.
- Vigila: Rendimiento (consultas/impresiones/CTR/posición), Páginas (cobertura de
  indexación) y los informes de Resultados enriquecidos (FAQ/Breadcrumb).

"Panel de métricas en la app" (futuro opcional): GA4 tiene Data API y Search
Console tiene API — una ruta de servidor puede consumir ambas y renderizar un
dashboard interno.

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
- Verificadores de `hreflang`; `site:metri.info` para vigilar la indexación.

# Manual de analítica (PostHog · GA4 · Vercel · Search Console)

> Guía reutilizable e independiente del proyecto para instrumentar una app web.
> Complemento de [`advanced-seo.es.md`](./advanced-seo.es.md). Objetivo: saber
> **quién** llega (adquisición), **qué** hace (comportamiento de producto), **qué
> tan rápido** se siente (rendimiento real) y **cómo** posicionas (búsqueda) — sin
> reinventarlo en cada proyecto.

**Contenido**

- [0. Modelo mental — las cuatro capas](#0-modelo-mental--las-cuatro-capas)
- [1. PostHog — analítica de producto](#1-posthog--analítica-de-producto)
- [2. Google Analytics 4 — adquisición y web](#2-google-analytics-4--adquisición-y-web)
- [3. Vercel Analytics y Speed Insights — RUM](#3-vercel-analytics-y-speed-insights--rum)
- [4. Google Search Console — la herramienta de SEO](#4-google-search-console--la-herramienta-de-seo)
- [5. Qué herramienta para qué pregunta](#5-qué-herramienta-para-qué-pregunta)
- [6. Cachear las lecturas del dashboard](#6-cachear-las-lecturas-del-dashboard)
- [7. Checklist de setup](#7-checklist-de-setup)

Ver también: [`advanced-seo.es.md`](./advanced-seo.es.md) ·
[`glossary.es.md`](./glossary.es.md).

---

## 0. Modelo mental — las cuatro capas

La analítica no es una sola herramienta. Elige una por capa; responden preguntas
distintas.

| Capa | Pregunta | Herramienta (este stack) | Los datos viven en |
| --- | --- | --- | --- |
| **Producto** | ¿Qué *hacen* los usuarios dentro? | **PostHog** | nube de PostHog |
| **Adquisición / web** | ¿Quién llega, desde dónde? | **Google Analytics 4** | Google |
| **Rendimiento real (RUM)** | ¿Qué tan rápido para usuarios reales? | **Vercel Speed Insights** | Vercel |
| **Búsqueda** | ¿Qué consultas posicionan y dónde? | **Google Search Console** | Google |

**Principio clave: nada de esto se guarda en *tu* base de datos.** Tu BD solo
guarda registros first-party que persistes a propósito (cuentas, elementos
guardados). Los eventos de analítica se envían al servicio externo y **se
almacenan allí**; tu app los **lee** de vuelta vía la API de cada servicio para
pintar un dashboard interno. Así tu BD se mantiene pequeña y el proveedor de
analítica es intercambiable.

```
Navegador ──capture()──▶ servidores PostHog / GA ──Query API / Data API──▶ tu dashboard /admin
                                   │
Tu Postgres ◀── solo escrituras explícitas (cuentas, cálculos guardados, favoritos)
```

---

## 1. PostHog — analítica de producto

### Qué es / qué brinda / en qué afecta

- **Qué:** analítica de producto a nivel de evento y por persona.
- **Brinda:** eventos custom, **session replay** (ver sesiones reales),
  **heatmaps** (zonas de calor), **funnels**, **retención**, **feature flags +
  experimentos A/B**, **encuestas**.
- **Afecta:** decisiones de producto — dónde se cae el usuario en un flujo, qué
  función se usa, qué construir después. No afecta directamente el ranking SEO.

### Cómo funciona

1. El SDK del navegador (`posthog-js`) hace `init` una vez y envía eventos al
   host de ingestión de PostHog.
2. El **autocapture** registra clics, pageviews y envíos de formularios sin código.
3. Tú agregas **eventos custom** para lo que importa (`signup_completed`,
   `checkout_started`, …).
4. `identify()` liga eventos anónimos a un id de usuario para que funcionen
   funnels/retención.
5. **Lees los datos de vuelta** con la **Query API (HogQL)** — SQL sobre tus
   eventos — para tus propios dashboards. Replays/heatmaps/funnels se ven en la
   app de PostHog.

### Las funciones que realmente llamas

```ts
// cliente (posthog-js)
posthog.init(KEY, { api_host: "/ingest", ui_host: "https://us.posthog.com" })
posthog.capture("nombre_evento", { cualquier: "propiedad" })  // evento custom
posthog.identify(userId, { email, plan })                      // ligar a persona
posthog.reset()                                                 // al cerrar sesión
posthog.isFeatureEnabled("new-checkout")                        // feature flag / A-B
posthog.group("company", orgId)                                 // group analytics B2B

// servidor (posthog-node) — para eventos que el cliente no ve con fiabilidad
const ph = new PostHog(KEY, { flushAt: 1, flushInterval: 0 })
ph.capture({ distinctId: userId, event: "signup_completed", properties })
await ph.flush()
```

Un wrapper fino mantiene los call sites limpios y a salvo de SSR:

```ts
// lib/analytics/track.ts
import posthog from "posthog-js";
export const track = (event: string, props?: Record<string, unknown>) => {
  if (typeof window === "undefined" || !posthog.__loaded) return;
  posthog.capture(event, props);
};
```

### Setup (esencial)

1. Crea un proyecto → copia la **Project API key** (`phc_…`). Es pública (clave de
   *ingestión*, segura en el navegador) → `NEXT_PUBLIC_POSTHOG_KEY`.
2. Inicializa una vez, alto en el árbol (componente cliente):

   ```tsx
   "use client";
   import posthog from "posthog-js";
   posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
     api_host: "/ingest",              // reverse proxy first-party (ver abajo)
     ui_host: "https://us.posthog.com",
     autocapture: true,
     capture_pageview: false,          // captura manual al cambiar de ruta en SPAs
     session_recording: { maskAllInputs: true },
   });
   ```

3. **Reverse proxy `/ingest` para esquivar ad blockers** (el paso de setup más
   impactante — los ad blockers tienen `*.posthog.com` en su lista y descartan en
   silencio una gran parte de los eventos). Envía los eventos a tu propio origen y
   reenvíalos:

   ```ts
   // next.config.ts
   const nextConfig = {
     skipTrailingSlashRedirect: true,
     async rewrites() {
       return [
         { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
         { source: "/ingest/:path*",        destination: "https://us.i.posthog.com/:path*" },
       ];
     },
   };
   ```

   Ahora el navegador solo habla con `tusitio.com/ingest/*` — first-party, no
   bloqueado. (Si además corres middleware de i18n/redirecciones, **excluye**
   `/ingest`.)

4. **Para leer datos en tu propio dashboard**, crea una **Personal API key**
   (`phx_…`, secreto de servidor) y obtén el **Project ID numérico**. Consulta con
   HogQL:

   ```ts
   const res = await fetch(`https://us.posthog.com/api/projects/${PROJECT_ID}/query`, {
     method: "POST",
     headers: { Authorization: `Bearer ${PERSONAL_API_KEY}`, "Content-Type": "application/json" },
     body: JSON.stringify({ query: { kind: "HogQLQuery", query:
       `SELECT event, count() FROM events
        WHERE timestamp >= now() - INTERVAL 30 DAY
        GROUP BY event ORDER BY 2 DESC LIMIT 10` } }),
     next: { revalidate: 300 },        // cachea 5 min; bajo los límites de rate
   });
   ```

   > Dos hosts distintos: los eventos **ingresan** por `us.i.posthog.com` (el
   > proxy `/ingest`); la **Query API** lee de `us.posthog.com`. No apuntes el host
   > de la query a `/ingest`.

### Funnels en HogQL (`windowFunnel`)

Un funnel mide cuántas personas pasan cada paso ordenado y dónde se caen.
`windowFunnel(ventana_segundos)(timestamp, cond1, cond2, …)` devuelve el paso en
orden más lejano que alcanzó cada persona dentro de la ventana:

```sql
SELECT
  countIf(level >= 1) AS visito,
  countIf(level >= 2) AS uso_feature,
  countIf(level >= 3) AS se_registro
FROM (
  SELECT person_id,
    windowFunnel(604800)(  -- ventana de 7 días
      timestamp,
      event = '$pageview',
      event = 'feature_used',
      event = 'signup_completed'
    ) AS level
  FROM events
  WHERE timestamp >= now() - INTERVAL 30 DAY
  GROUP BY person_id
)
```

Los conteos decrecen siempre; el mayor salto es tu mayor fuga.

### Objetivos alcanzables

Funnels de conversión · adopción y retención de features · session replay para
depurar UX · heatmaps de clics reales · experimentos A/B con flags · encuestas
in-app · cohortes. El tier gratis es generoso (≈1M eventos + 5k replays/mes); se
paga por volumen y por enterprise (SSO, group analytics, data pipelines,
retención larga).

### Privacidad

Respeta Do-Not-Track, `maskAllInputs` en los replays, y el proxy first-party
mantiene las requests en el mismo origen. Sin PII salvo que la pongas en
`identify`.

---

## 2. Google Analytics 4 — adquisición y web

### Qué es / qué brinda / en qué afecta

- **Qué:** la analítica web/marketing de Google.
- **Brinda:** sesiones, usuarios, pageviews, **fuentes/campañas de tráfico**,
  audiencia (país, dispositivo, idioma), conversiones, y funnels en Explore.
- **Afecta:** decisiones de marketing/SEO (de dónde viene el tráfico, qué páginas
  lo atraen). Se integra con Google Ads y Search Console.

### Cómo funciona — dos mitades

GA4 tiene un lado de **escritura** y uno de **lectura** que usan identificadores
*distintos*:

| | Identificador | Para qué |
| --- | --- | --- |
| **Escritura (tag)** | **Measurement ID** `G-XXXXXXXX` | `gtag.js` *envía* eventos a GA |
| **Lectura (API)** | **Property ID** (numérico) | la **Data API** *lee* los datos |

Pertenecen a la misma propiedad pero no son intercambiables — error de setup
común.

### Setup (esencial)

1. **Escritura:** crea una propiedad GA4 → agrega un **data stream Web** → copia
   el **Measurement ID** → instala el tag. En Next:

   ```tsx
   import { GoogleAnalytics } from "@next/third-parties/google";
   // en el layout raíz, gateado para que esté apagado hasta configurarlo:
   {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
   ```

2. **Lectura (opcional, para un dashboard interno):**
   - Habilita la **Google Analytics Data API** en Google Cloud.
   - Crea un **service account**; descarga su **JSON key**.
   - En GA4 → Admin → **Property Access Management**, agrega el email del service
     account como **Viewer**.
   - Provee `GA4_PROPERTY_ID` (numérico) + el JSON inline en una env var.

   ```ts
   import { BetaAnalyticsDataClient } from "@google-analytics/data";
   const client = new BetaAnalyticsDataClient({
     credentials: JSON.parse(process.env.GA4_CREDENTIALS_JSON!),
   });
   const [res] = await client.runReport({
     property: `properties/${process.env.GA4_PROPERTY_ID}`,
     dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
     dimensions: [{ name: "country" }],
     metrics: [{ name: "activeUsers" }],
     orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
     limit: 10,
   });
   // runRealtimeReport() para usuarios activos en los últimos 30 min
   ```

### Fortalezas / límites

Fuerte en adquisición y en el ecosistema Google; **pero** los datos tienen
latencia de procesamiento (horas), pueden venir **muestreados** (sampling) en
rangos grandes, y son agregados (menos detalle por usuario que PostHog). El tier
gratis incluye **export a BigQuery**; GA4 360 (enterprise) elimina el sampling y
extiende la retención.

---

## 3. Vercel Analytics y Speed Insights — RUM

- **Vercel Analytics** — pageviews/eventos respetuosos de la privacidad, sin
  banner de cookies, cero config en Vercel.
- **Vercel Speed Insights** — **Core Web Vitals de usuarios reales** (LCP/CLS/INP).
  Estos son los datos de **campo** **relevantes para SEO** que Google realmente
  usa para rankear.

```tsx
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
// renderiza ambos una vez en el layout raíz
```

Las herramientas de laboratorio (Lighthouse) estiman; Speed Insights mide el
**campo** — sigue ambos, pero el campo manda.

---

## 4. Google Search Console — la herramienta de SEO

No es "analítica" en el sentido JS; es cómo ves tu presencia en **búsqueda**.
Hazlo **primero** — es el paso de SEO de mayor impacto.

- Agrega el dominio como propiedad; verifica (DNS TXT o el meta
  `verification.google`).
- Envía `https://tusitio.com/sitemap.xml`.
- Observa: **Performance** (consultas, impresiones, CTR, posición media),
  **Pages** (cobertura de indexación), **Enhancements** (validez de rich results
  FAQ/Breadcrumb).
- También tiene API — puedes jalar datos de consultas/posición al mismo dashboard
  interno junto a GA4 + PostHog.

---

## 5. Qué herramienta para qué pregunta

| Quieres saber… | Usa |
| --- | --- |
| De dónde viene el tráfico (orgánico/referral/campaña) | GA4 |
| Qué consultas posicionas + posición | Search Console |
| Si usuarios reales tienen buenos Core Web Vitals | Vercel Speed Insights |
| Dónde se caen los usuarios en un flujo signup/checkout | Funnel de PostHog |
| Qué hizo realmente un usuario confundido | Session replay de PostHog |
| Qué botones se clican | Heatmap / autocapture de PostHog |
| Si la variante B convierte mejor | Experimento de PostHog (feature flag) |

El solapamiento está bien e incluso es útil (GA y PostHog cuentan pageviews) —
correr ambos te enseña la latencia, el sampling y las fortalezas de cada uno.

---

## 6. Cachear las lecturas del dashboard

Tanto las llamadas a HogQL como a la Data API de GA son **lecturas agregadas
caras** que no necesitan ser en tiempo real en una página de admin. Cachéalas,
pero manténlas lo bastante frescas para que se sientan vivas:

```ts
// basadas en fetch (HogQL de PostHog): tag + revalidate en la request
fetch(url, { next: { revalidate: 300, tags: ["metrics:posthog"] } })

// lecturas que no son fetch (agregados de BD): envuelve una vez
export const getMetrics = unstable_cache(load, ["metrics"], {
  revalidate: 300, tags: ["metrics:db"],
});
// invalida desde un Server Action tras una escritura relevante:
updateTag("metrics:db");   // invalidador de un argumento en Next 16
```

Gotcha común: un `revalidate` largo (p. ej. 1 hora) hace que un panel de analítica
recién desplegado se vea "congelado" mientras un panel hermano sin caché se ve
vivo. Iguala su frescura (≈5 min) para que las comparaciones sean justas.

---

## 7. Checklist de setup

- [ ] Project API key de PostHog puesta; SDK inicializado una vez con autocapture.
- [ ] **Reverse proxy `/ingest`** activo (verifica en DevTools → Network: eventos
      200 hacia tu propio origen, no a `*.posthog.com`).
- [ ] Eventos custom con nombres consistentes (`snake_case`), `identify` al
      iniciar sesión, `reset` al cerrarla.
- [ ] Personal API key de PostHog + Project ID numérico puestos para las lecturas.
- [ ] Measurement ID de GA4 (`G-…`) instalado; el tag dispara (Realtime te lo
      muestra).
- [ ] Data API de GA4 habilitada + service account (Viewer) + Property ID numérico
      para el dashboard.
- [ ] Vercel Analytics + Speed Insights renderizados en el layout raíz.
- [ ] Search Console verificado + sitemap enviado.
- [ ] Lecturas del dashboard cacheadas (~5 min) e invalidadas por tag en escrituras.
- [ ] Privacidad: DNT respetado, inputs de replay enmascarados, sin PII en eventos.

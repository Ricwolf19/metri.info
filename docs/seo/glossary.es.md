# Glosario de SEO y analítica web

> Un glosario de referencia rápida de los términos de SEO, datos estructurados,
> renderizado y analítica usados en la documentación de este proyecto. Complemento
> de [`advanced-seo.en.md`](./advanced-seo.en.md) y
> [`analytics.en.md`](./analytics.en.md). Cada entrada explica **qué** es un
> término y **por qué importa / a qué afecta** — concisa, práctica y
> agnóstica del proyecto.

Las entradas se agrupan en cinco secciones; dentro de cada una están **ordenadas
alfabéticamente**.

- [SEO y contenido](#seo-y-contenido)
- [Datos estructurados](#datos-estructurados)
- [Renderizado y Next.js](#renderizado-y-nextjs)
- [Core Web Vitals y rendimiento](#core-web-vitals-y-rendimiento)
- [Analítica e instrumentación](#analítica-e-instrumentación)

---

## SEO y contenido

**Canonical URL (URL canónica)** — La única URL "oficial" de un contenido,
declarada con `<link rel="canonical">` (o `alternates.canonical` en los metadatos
de Next). Le indica a los buscadores qué URL indexar cuando varias muestran el
mismo contenido (variantes con parámetros, `www`/barra final, `http`/`https`).
Consolida las señales duplicadas para que la fuerza de posicionamiento no se
reparta.

**Crawl budget (presupuesto de rastreo)** — La cantidad de URLs que un buscador
está dispuesto a rastrear en tu sitio en una ventana de tiempo. Malgastarlo en
URLs con parámetros infinitos, redirecciones o páginas pobres hace que las
páginas importantes se rastreen (y actualicen) con menos frecuencia. Importa
sobre todo en sitios grandes; mantén las URLs basura fuera con `robots.txt` y
`noindex`.

**CTR (tasa de clics)** — Clics ÷ impresiones de un resultado en la SERP. Un buen
**title tag**, **meta description** y los **rich results** lo elevan. Es a la vez
una métrica de éxito (más tráfico por posición) y, probablemente, una señal de
posicionamiento suave: una página que se muestra mucho pero recibe pocos clics
puede caer.

**E-E-A-T** — Experiencia, Pericia (Expertise), Autoridad y Confianza
(Trustworthiness): el marco de calidad de Google para juzgar el contenido y a su
autor/sitio. No es una puntuación directa, sino la guía de evaluadores que moldea
el posicionamiento — sobre todo en temas **YMYL**. Se demuestra con un autor
real, fuentes citadas, una página "Acerca de" y fechas de "última revisión".

**Featured snippet (fragmento destacado)** — Un recuadro de respuesta en la
cima de la SERP (posición "cero") que cita una página directamente. Se gana con
respuestas concisas y bien estructuradas (un párrafo de definición claro, una
lista o una tabla) a una consulta tipo pregunta. Gran beneficio de **CTR**,
aunque también puede resolver la consulta sin clic.

**hreflang** — Una etiqueta que declara las variantes de idioma/región de una
página, p. ej. `<link rel="alternate" hreflang="es" href="…">`. Le dice a Google
que sirva la versión de idioma correcta y evita que tus propias páginas EN/ES
compitan entre sí. Debe ser **recíproca** (cada variante apunta de vuelta) e
incluir **x-default**.

**Impressions (impresiones)** — Cuántas veces apareció una página en los
resultados de búsqueda para los usuarios (se haya hecho clic o no). Se reportan en
Search Console; son el denominador del **CTR**. Impresiones al alza con clics
estancados suele significar que posicionas, pero no lo bastante alto o con un
snippet débil.

**Indexation (indexación)** — Si una URL está realmente almacenada en el índice
del buscador y, por tanto, es elegible para posicionar. Una página puede
rastrearse pero no indexarse (contenido pobre, `noindex`, duplicado). Revisa la
cobertura en el informe de Páginas de Search Console; si no está indexada, no
puede posicionar para nada.

**Internal linking (enlazado interno)** — Enlaces entre tus propias páginas.
Distribuyen el link equity (fuerza de posicionamiento) por el sitio y señalan qué
páginas son importantes y cómo se relacionan. Enlazar estrechamente las páginas de
un mismo tema es lo que construye un **topical cluster**.

**Keyword (palabra clave)** — Una consulta (palabra o frase) que los usuarios
escriben y para la que quieres posicionar una página. Guía el **slug**, el
**title tag**, el H1 y el texto de la página. El SEO moderno apunta a la
*intención* tras una keyword y sus sinónimos, no a la repetición literal (que se
lee como spam).

**Meta description** — El fragmento `<meta name="description">` que se muestra
bajo el título en la SERP. No es un factor de posicionamiento, pero sí una gran
palanca de **CTR**: una frase clara y orientada al beneficio con la keyword gana
clics. Mantenla en ≤ ~160 caracteres o Google la trunca (y puede reescribirla de
todos modos).

**noindex / nofollow** — Directivas para robots. `noindex` mantiene una URL fuera
del índice (úsala en páginas pobres/duplicadas/con parámetros); `nofollow` indica
a los buscadores que no pasen crédito de posicionamiento por un enlace (o, en
`<meta robots>`, que no sigan los enlaces de la página). Un `noindex` accidental
en producción hunde el tráfico en silencio.

```ts
export const metadata = { robots: { index: false, follow: true } };
```

**Rich results / rich snippets (resultados enriquecidos)** — Listados de la SERP
mejorados con elementos visuales extra a partir de los **datos estructurados**:
acordeones de FAQ, migas de pan, valoraciones con estrellas, sitelinks. Ocupan
más espacio vertical y elevan el **CTR**. Solo marca contenido que sea realmente
visible en la página, o es una violación de las directrices.

**robots.txt** — Un archivo en `/robots.txt` que da a los rastreadores reglas de
permitir/bloquear a nivel de sitio y la ubicación del sitemap. Controla el
**rastreo**, no la indexación: una página bloqueada aún puede indexarse si la
enlazan desde otro sitio (usa `noindex` para mantenerla fuera de los resultados).
Bloquea `/api/`, rutas de autenticación y URLs de resultado con `?param`.

**SearchAction / sitelinks searchbox** — JSON-LD de `WebSite` + `SearchAction` que
le dice a Google que tu sitio tiene búsqueda interna, lo que puede renderizar una
caja de búsqueda dentro de tu listado de marca en la SERP. Una mejora a nivel de
página de inicio; afecta cómo se ve tu resultado de marca y cómo los usuarios
saltan directo a tu sitio.

**SERP** — Página de resultados del buscador (Search Engine Results Page): la
página de resultados de una consulta. Mezcla enlaces orgánicos, anuncios y
*funciones* (featured snippets, "Otras preguntas", paquetes de imágenes/vídeos,
paneles de conocimiento). Tu verdadera competencia es todo lo que hay en ella, no
solo la página posicionada encima.

**Sitemap (mapa del sitio)** — Un archivo XML (`/sitemap.xml`) que lista tus URLs
indexables, cada una con `lastModified`, prioridad y alternativas **hreflang** por
URL. Acelera un descubrimiento completo y fresco — sobre todo de páginas nuevas o
profundas. Envíalo en Search Console.

```ts
// app/sitemap.ts
export default function sitemap() {
  return ROUTES.map((r) => ({ url: abs(r.en), lastModified: new Date() }));
}
```

**Slug** — La porción legible de la ruta de URL que identifica una página, p. ej.
`ffmi-calculator` en `/tools/ffmi-calculator`. Una keyword en el slug es una
señal de posicionamiento y **CTR**; los slugs localizados
(`/es/herramientas/calculadora-ffmi`) ganan las SERPs de cada idioma. Mantenlos
cortos, en minúsculas y con guiones.

**Title tag (etiqueta de título)** — El elemento `<title>` (definido vía `title`
en los metadatos), que se muestra como el titular clicable de la SERP y la
etiqueta de la pestaña del navegador. La señal de relevancia on-page más fuerte
*y* el principal motor de **CTR**. Mantenlo en ≤ ~60 caracteres, único por
página, con la keyword cerca del inicio.

**Topical cluster (clúster temático)** — Un grupo de páginas relacionadas que
cubren un tema en profundidad, interenlazadas alrededor de un hub. Señala
autoridad temática, de modo que todo el clúster posiciona mejor de lo que lo
harían páginas aisladas. Se construye con **internal linking** entre una página
pilar y sus artículos/herramientas de apoyo.

**x-default** — El valor especial de **hreflang** que nombra la página de
respaldo para usuarios cuyo idioma/región no segmentas explícitamente. Inclúyelo
en cada conjunto de alternativas de idioma para que los visitantes sin
coincidencia aterricen en algo sensato en vez de en un idioma equivocado.

```ts
languages: { en: "/tools/x", es: "/es/herramientas/x", "x-default": "/tools/x" }
```

**YMYL** — "Your Money or Your Life" (tu dinero o tu vida): contenido que podría
afectar la salud, finanzas, seguridad o bienestar de una persona (médico, legal,
financiero). Google le exige un listón de **E-E-A-T** mucho más alto. Las
calculadoras de fitness/salud califican, así que necesitan fuentes citadas, un
autor y un aviso legal para posicionar.

---

## Datos estructurados

**Article (artículo)** — Tipo de schema.org para una entrada de noticias, blog o
base de conocimiento. Aporta titular, autor, fechas de publicación/modificación e
imagen a los buscadores, habilitando los resultados enriquecidos de artículo y
alimentando las señales **E-E-A-T**. Usa `MedicalWebPage` en su lugar (o además)
para contenido de salud.

**BreadcrumbList (lista de migas de pan)** — Tipo de schema.org que describe la
posición de la página en la jerarquía del sitio (Inicio › Herramientas ›
Calculadora FFMI). Renderiza un rastro de migas en la SERP en lugar de una URL
cruda, aclarando el contexto y elevando el **CTR**. Barato de añadir a cualquier
página profunda.

**FAQPage (página de preguntas frecuentes)** — Tipo de schema.org que marca una
lista de pares pregunta/respuesta. El **rich result** de mayor apalancamiento para
páginas de herramientas/contenido — puede mostrar una FAQ desplegable directamente
en la SERP, ocupando espacio extra. Solo marca FAQs realmente visibles en la
página.

```json
{ "@type": "FAQPage", "mainEntity": [
  { "@type": "Question", "name": "…", "acceptedAnswer": { "@type": "Answer", "text": "…" } }
]}
```

**JSON-LD** — JavaScript Object Notation for Linked Data: el formato recomendado
para los **datos estructurados**, emitido como un bloque
`<script type="application/ld+json">` (idealmente renderizado en el servidor).
Mantiene el marcado legible por máquinas separado del HTML visible, lo cual es más
limpio que el microdata en línea.

**LocalBusiness (negocio local)** — Tipo de schema.org para un negocio físico
(nombre, dirección, horario, geo, teléfono). Impulsa los resultados enriquecidos
del local-pack y mapas, y el panel de conocimiento del negocio. Relevante cuando
un sitio representa una ubicación del mundo real; omítelo para herramientas
puramente digitales.

**MedicalWebPage (página web médica)** — Tipo de schema.org para contenido
médico/de salud, opcionalmente con `reviewedBy`, `lastReviewed` y `citation`
citadas. Señala la confianza que el posicionamiento **YMYL** exige. Combínalo con
**Article** y fuentes reales en calculadoras de salud y documentos médicos.

**Organization (organización)** — Tipo de schema.org que describe la entidad
detrás del sitio (nombre legal, logo, perfiles sociales, contacto). Se suele
emitir una sola vez en la página de inicio; siembra el **panel de conocimiento** de
la marca y enlaza tus señales sociales/de identidad en una sola entidad.

**Product (producto)** — Tipo de schema.org para un artículo vendible (nombre,
imagen, precio, moneda, disponibilidad, `AggregateRating`/`Review`). Habilita los
resultados enriquecidos de precio, stock y estrellas que afectan mucho al **CTR**
en consultas comerciales. Las reseñas deben ser genuinas y estar en la página.

**schema.org** — El vocabulario compartido entre buscadores de tipos (`Article`,
`Product`, `FAQPage`, …) y propiedades usado para describir el contenido de la
página a las máquinas. Es el diccionario; **JSON-LD** es cómo lo escribes. Valida
el marcado con el Schema Markup Validator y el Rich Results Test de Google.

**SoftwareApplication (aplicación de software)** — Tipo de schema.org para una app
o herramienta interactiva (nombre, categoría, sistema operativo, precio,
valoración). El tipo natural para una calculadora o app web; puede ganar
resultados enriquecidos y aclara a los buscadores que la página *es* una
herramienta usable. `WebApplication` es un subtipo más específico.

**WebSite (sitio web)** — Tipo de schema.org que representa el sitio en su
conjunto, portando su nombre y (con **SearchAction**) la sitelinks searchbox. Se
emite una sola vez en la página de inicio junto a **Organization**; ayuda a Google
a mostrar el nombre de tu marca y una caja de búsqueda en la SERP.

---

## Renderizado y Next.js

**Client island (isla cliente)** — Un pequeño componente interactivo `"use client"`
incrustado en una página que, por lo demás, se renderiza en el servidor. Mantiene
al mínimo el JS enviado al navegador para que la página siga siendo rápida e
indexable a la vez que interactiva (p. ej. un widget de calculadora dentro de una
página de contenido estático).

**generateMetadata** — Una función asíncrona del App Router de Next.js que
devuelve el `<title>`, descripción, canonical, OG, etc. de una página *por
petición/parámetro*. Úsala siempre que los metadatos varíen según la ruta (una
calculadora frente a otra); usa el export estático `metadata` cuando sean fijos.

```ts
export const generateMetadata = async ({ params }) => ({ title: getCalc(params.slug).title });
```

**Hydration (hidratación)** — El proceso del lado del cliente en que React adjunta
los manejadores de eventos al HTML renderizado en el servidor, volviéndolo
interactivo. Hasta que termina, la página parece lista pero no es clicable; una
hidratación pesada perjudica el **INP**. **Client islands** más pequeñas suponen
menos que hidratar.

**ISR (regeneración estática incremental)** — Servir una página generada
estáticamente y luego regenerarla en segundo plano tras un intervalo `revalidate`
(o bajo demanda). Combina la velocidad de **SSG** con la frescura, de modo que el
contenido se actualiza sin un rebuild completo. Se define con
`export const revalidate = 3600` u opciones de fetch.

**manifest / PWA** — El manifiesto de la app web (`app/manifest.ts` →
`/manifest.webmanifest`) declara nombre, iconos y color del tema para que el sitio
sea instalable como una Progressive Web App. Con un service worker habilita el uso
offline y un lanzamiento tipo app; también alimenta cierta presentación en
SERP/app.

**metadataBase** — La `URL` base absoluta definida en los metadatos raíz para que
las rutas relativas de canonical y de la **imagen OG** se resuelvan a URLs
absolutas. Sin ella, las vistas previas sociales y los canonicals pueden romperse.
Defínela una sola vez en el layout raíz.

```ts
export const metadata = { metadataBase: new URL("https://example.com") };
```

**middleware / proxy** — Código (Next.js Middleware) que se ejecuta *antes* de
servir una petición, para redirecciones, rewrites, autenticación o ruteo de
idioma. Potente, pero vuelve las páginas no estáticas y añade latencia en cada
petición — prefiere el ruteo estático cuando sea posible, y excluye rutas como el
rewrite de analítica `/ingest`.

**Open Graph (OG) image (imagen Open Graph)** — La imagen de la tarjeta de vista
previa que se muestra al compartir un enlace en redes sociales o en algunas
funciones de la SERP, generada por ruta vía `opengraph-image.tsx` (el
`ImageResponse` de Next, 1200×630). Hace que los enlaces compartidos se vean
intencionados y con marca — una palanca real de **CTR**.

**reverse proxy (proxy inverso)** — Un servidor que recibe peticiones en tu propio
origen y las reenvía a un tercero. Se usa para servir la analítica desde una ruta
de primera parte (p. ej. reescribir `/ingest/*` hacia PostHog) para que los
**bloqueadores de anuncios** que vetan `*.posthog.com` no descarten eventos. El
navegador solo ve tu dominio.

**Server Component (RSC) (componente de servidor)** — Un componente de React que se
renderiza solo en el servidor y envía cero JS al cliente. El predeterminado del
App Router; todo lo crítico para SEO (encabezados, texto, enlaces, datos
estructurados) debería serlo para estar en el HTML inicial. La interactividad va
en **client islands**.

**SSG (generación de sitio estático)** — Renderizar las páginas a HTML en tiempo de
build y luego servirlas desde el edge/CDN. Da el **TTFB**/**LCP** más rápido y un
HTML completamente formado para los rastreadores. El modo preferido para páginas
de contenido y herramientas aquí.

**SSR (renderizado del lado del servidor)** — Renderizar el HTML de una página en
el servidor *por petición*. Amigable para rastreadores como **SSG**, pero más
lento (el trabajo ocurre en cada acceso) — úsalo cuando el contenido sea
específico de la petición (personalizado, en tiempo real) en vez de cacheable.

---

## Core Web Vitals y rendimiento

**CLS (Cumulative Layout Shift)** — Un **Core Web Vital** que mide el movimiento
inesperado del layout mientras la página carga (objetivo < 0,1). Causado por
imágenes/anuncios/fuentes sin espacio reservado. Dimensiones fijas en los medios y
`font-display: swap` con métricas de respaldo coincidentes lo mantienen bajo.

**Core Web Vitals (CWV)** — El conjunto de métricas de UX de usuario real (campo)
de Google — **LCP**, **CLS** e **INP** — usado como señal de posicionamiento y
chequeo de salud de UX. Umbrales "buenos": LCP < 2,5 s, CLS < 0,1, INP < 200 ms.
Se miden a partir de visitantes reales, no solo de pruebas de laboratorio.

**FID (First Input Delay)** — *Obsoleto.* El antiguo **Core Web Vital** de
capacidad de respuesta a la entrada (el retardo antes de procesar la primera
interacción). **Reemplazado por INP** en marzo de 2024, que mide la capacidad de
respuesta en toda la visita y no solo en la primera entrada. Se menciona solo
porque guías antiguas aún lo citan.

**INP (Interaction to Next Paint)** — El **Core Web Vital** de capacidad de
respuesta (objetivo < 200 ms): la latencia desde una interacción del usuario hasta
la siguiente actualización visual, en todas las interacciones de una visita. Un
INP alto suele significar demasiado JS en el hilo principal — reduce las **client
islands** y aplaza los scripts no críticos.

**Lab vs field data (datos de laboratorio vs de campo)** — Dos formas de medir el
rendimiento. *Laboratorio* (sintético, p. ej. **Lighthouse**) corre en un entorno
controlado — reproducible, bueno para depurar. *Campo* (**RUM**, visitantes
reales) refleja dispositivos/redes reales y es sobre lo que Google posiciona.
Rastrea ambos; en caso de discrepancia, manda el de campo.

**LCP (Largest Contentful Paint)** — El **Core Web Vital** que marca cuándo el
elemento visible más grande (normalmente la imagen hero o el bloque de encabezado)
termina de renderizarse (objetivo < 2,5 s). La métrica titular de "¿ya cargó?".
Mejóralo con **SSG** + entrega en el edge, imágenes optimizadas y `next/font`.

**Lighthouse** — La herramienta de auditoría de código abierto de Google (en Chrome
DevTools / PageSpeed Insights) que puntúa Rendimiento, SEO, Accesibilidad y
Buenas Prácticas en una sola corrida de **laboratorio**. Excelente para detectar
regresiones antes del lanzamiento; recuerda que sus números de CWV son
estimaciones, no los datos de **campo** usados para posicionar.

**RUM (Real-User Monitoring)** — Recopilar métricas de rendimiento desde los
navegadores de visitantes reales en vez de pruebas sintéticas — es decir, datos de
**campo**. Captura la dispersión de dispositivos y redes reales, que es
exactamente lo que usa el posicionamiento por **Core Web Vitals**. Vercel Speed
Insights es la herramienta de RUM en este stack.

**TTFB (Time To First Byte)** — El tiempo desde la petición hasta que llega el
primer byte de la respuesta. No es un Core Web Vital en sí, pero es la base del
**LCP** — un TTFB lento retrasa todo. **SSG** servido desde el edge/CDN lo reduce
(objetivo < ~600 ms).

---

## Analítica e instrumentación

**A/B experiment (experimento A/B)** — Dividir el tráfico entre dos (o más)
variantes para medir cuál rinde mejor en una métrica, normalmente tras un
**feature flag**. Convierte "creo que B es mejor" en una decisión medida. En este
stack, se ejecuta vía experimentos de PostHog.

**Autocapture (autocaptura)** — El modo de PostHog que registra automáticamente
clics, pageviews y envíos de formulario sin código por evento. Da una cobertura
base instantánea y alimenta los **heatmaps**; el costo es datos más ruidosos y un
nombrado menos semántico que los **custom events**.

**Cohort (cohorte)** — Un grupo de usuarios definido por un rasgo o acción
compartidos (p. ej. "se registró en mayo", "usó la calculadora"). Se usa para
segmentar **funnels**, **retención** y otros informes y así comparar lo comparable
en vez de un promedio indiferenciado.

**Custom event (evento personalizado)** — Un evento con nombre explícito que
disparas para una acción significativa, p. ej.
`posthog.capture("signup_completed", { plan })`. Más preciso y fácil de analizar
que la **autocapture**; la columna vertebral de los **funnels** y del seguimiento
de conversiones. Nómbralos de forma consistente (`snake_case`).

**Distinct ID (ID distintivo)** — El identificador que PostHog usa para vincular
eventos a una persona. Empieza como un ID de dispositivo anónimo y, tras el
**identify**, se fusiona con tu ID de usuario estable — de modo que la actividad de
una persona antes y después del login se cose en una sola línea de tiempo.

**DNT (Do-Not-Track / No rastrear)** — Una señal del navegador
(`navigator.doNotTrack`) que pide a los sitios no rastrear al usuario. Respetarla
(omitiendo o anonimizando la captura) es una práctica de privacidad y, a veces, de
cumplimiento. PostHog se puede configurar para respetarla.

**event (evento)** — La unidad atómica de la analítica de producto: un registro
con nombre de que algo ocurrió (un pageview, clic o **custom event**), con una
marca de tiempo, un **distinct ID** y propiedades arbitrarias. Todo lo posterior —
funnels, retención, heatmaps — se calcula a partir del flujo de eventos.

**Feature flag (bandera de funcionalidad)** — Un interruptor remoto de
encendido/apagado (o multivariante) que activa una funcionalidad para usuarios
elegidos sin un deploy. Habilita despliegues graduales, kill switches y la
asignación de variantes detrás de un **A/B experiment**. Se consulta con
`posthog.isFeatureEnabled("new-checkout")`.

**Funnel (embudo)** — Una secuencia ordenada de pasos (visita → usar función →
registrarse) que muestra cuántas personas alcanzan cada paso y dónde abandonan. El
mayor salto entre pasos es tu mayor fuga. En HogQL, se construye con
`windowFunnel(window_seconds)(timestamp, cond1, cond2, …)`.

**gtag** — El global site tag de Google (`gtag.js`) que *envía* eventos a **GA4**
usando el **Measurement ID**. Es el lado de escritura de GA4; en Next se carga vía
el componente `GoogleAnalytics` de `@next/third-parties`. Distinto de la Data API
que lee los datos de vuelta.

**Heatmap (mapa de calor)** — Una superposición visual que agrega dónde hacen
clic, mueven el cursor y desplazan los usuarios en una página. Revela qué atrae la
atención o se ignora sin leer eventos crudos. Impulsado por la **autocapture** de
PostHog.

**HogQL** — El dialecto de SQL de PostHog para consultar tus datos de eventos
crudos a través de la Query API. Permite construir métricas y dashboards
personalizados (p. ej. `SELECT event, count() FROM events GROUP BY event`) más
allá de los informes prefabricados. Lee desde `us.posthog.com`, no desde el proxy
`/ingest`.

**identify** — La llamada (`posthog.identify(userId, traits)`) que asocia el
**distinct ID** anónimo actual con un usuario conocido y le adjunta rasgos (email,
plan). Ejecútala en el login para que los funnels y la **retención** sigan a
usuarios reales; combínala con `reset()` en el logout.

**Measurement ID (GA4)** — El id `G-XXXXXXXX` de un **Web data stream** de GA4,
usado por **gtag** para *enviar* eventos. Es el identificador de "escritura" —
público, vive en el tag del navegador. No lo confundas con el **Property ID**
numérico usado para leer datos.

**Property ID (GA4)** — El id numérico de una propiedad de GA4, usado por la **Data
API** para *leer* la analítica de vuelta hacia tu propio dashboard. El
identificador de "lectura" — emparejado con una credencial de cuenta de servicio.
No es intercambiable con el **Measurement ID**.

**Retention (retención)** — Un informe que mide si los usuarios *vuelven* con el
tiempo tras una primera acción (tasas de retorno a día 1, 7, 30). La señal más
clara de valor real y duradero frente a visitas de una sola vez. Suele
segmentarse por **cohorte**.

**RUM** — Ver **RUM (Real-User Monitoring)** en Core Web Vitals y rendimiento; la
misma idea de datos de campo aplica aquí a la analítica de rendimiento.

**Sampling (muestreo)** — Calcular una métrica a partir de un subconjunto de
eventos y extrapolar, para mantener rápidas/baratas las consultas grandes. Cambia
exactitud por velocidad y puede engañar en segmentos pequeños. GA4 puede muestrear
rangos de fechas grandes; PostHog/HogQL suele devolver conteos exactos.

**Session replay (repetición de sesión)** — Una reproducción tipo vídeo,
reconstruida, de la sesión de un usuario real (con las entradas enmascaradas).
Invaluable para depurar UX confusa y rage-clicks que las métricas agregadas no
explican. Una función de PostHog; enmascara campos sensibles con `maskAllInputs`.

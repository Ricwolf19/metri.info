# Sitemaps e indexación — runbook operativo

> Complemento de [`advanced-seo.es.md`](./advanced-seo.es.md) (que cubre cómo se
> **construyen** los assets). Este doc es el lado **operativo**: qué es un sitemap,
> cómo lo genera metri.info, cómo enviarlo a Google y cómo diagnosticar los errores
> de Search Console que realmente aparecen. Es específico del proyecto, pero los
> principios son reutilizables.

**Contenido**

- [1. Qué es un sitemap (concepto)](#1-qué-es-un-sitemap-concepto)
- [2. Cómo lo genera metri.info](#2-cómo-lo-genera-metriinfo)
- [3. `lastModified` — qué es y cómo ponerlo bien](#3-lastmodified--qué-es-y-cómo-ponerlo-bien)
- [4. Enviarlo a Google Search Console](#4-enviarlo-a-google-search-console)
- [5. Solucionar los errores de GSC](#5-solucionar-los-errores-de-gsc)
- [6. Comandos de verificación](#6-comandos-de-verificación)
- [7. Notas que a Google sí le importan](#7-notas-que-a-google-sí-le-importan)

---

## 1. Qué es un sitemap (concepto)

Un **sitemap** es una lista legible por máquina de las URLs de tu sitio que quieres
que los buscadores conozcan. **No** es para usuarios y **no** es un menú — es una
pista de descubrimiento para los crawlers.

- **Formato:** XML (el esquema `sitemaps.org`). Es un `<urlset>` de entradas
  `<url>`, cada una con `<loc>` (la URL) y opcionalmente `<lastmod>`, `<changefreq>`,
  `<priority>` y `<xhtml:link>` con las alternativas de idioma.
- **Qué hace:** le dice a Google *cuáles* URLs existen y *cuándo cambiaron por
  última vez*, para que las encuentre y re-rastree con eficiencia. Es una **ayuda de
  descubrimiento**, no una garantía de indexación — Google sigue decidiendo qué
  indexa.
- **Qué no es:** no fuerza la indexación, no sube el ranking y no es obligatorio en
  un sitio chico (Google puede rastrear por enlaces). Importa sobre todo en sitios
  nuevos, páginas profundas y páginas con pocos enlaces entrantes — justo nuestro
  caso.
- **Dos formas en que Google lo encuentra:** (a) la línea `Sitemap:` en
  `robots.txt`, y (b) el envío explícito en Search Console. Usamos ambas.

Una página HTML (como la home) **no** es un sitemap. Si apuntas a Google a una
página HTML y la llamas sitemap, reporta *"tu sitemap parece ser una página HTML"* —
ver [§5](#5-solucionar-los-errores-de-gsc).

## 2. Cómo lo genera metri.info

Todo es **basado en archivos** vía la API `MetadataRoute` del App Router de Next.js
— sin plugin, sin XML manual. Dos archivos:

| Archivo | Produce | Notas |
|---------|---------|-------|
| `app/sitemap.ts` | `https://metri.info/sitemap.xml` | Next sirve XML válido con `Content-Type: application/xml`. |
| `app/robots.ts` | `https://metri.info/robots.txt` | Permite `/`, bloquea `/api/` y `/admin`, y apunta `Sitemap:` al XML. |

`app/sitemap.ts` devuelve un arreglo `MetadataRoute.Sitemap`. Cada `entry()` también
emite **alternativas hreflang** (`en` en la raíz, `es` bajo `/es`) para que Google
empareje las dos versiones de idioma en vez de tratarlas como duplicados:

```ts
alternates: { languages: { en: absoluteUrl(enPath), es: absoluteUrl(esPath) } }
```

Actualmente emite **45 URLs**: home, hub de tools, cada calculadora, docs, changelog,
download y las páginas legales. Las páginas de auth/privadas (`sign-in`, `sign-up`,
`admin`, `forgot/reset-password`, `account`, compartir `/s/[id]`) quedan a propósito
**fuera** del sitemap *y* marcadas con `robots: { index: false }` en su metadata —
nunca quieres que esas se indexen.

**Regla:** cuando agregues una ruta pública, agrégala a `app/sitemap.ts`. Cuando
agregues una ruta privada, dale a su página `export const metadata = { robots: { index: false } }`.

## 3. `lastModified` — qué es y cómo ponerlo bien

`<lastmod>` le dice a Google cuándo cambió por última vez el contenido de una URL,
para que priorice re-rastrear lo que realmente se movió.

> **Implementado en este repo:** las URLs de docs ahora emiten un `<lastmod>` real
> — el `updatedAt` del propio artículo en frontmatter si está, si no
> `DOC_LAST_REVIEWED` (`lib/docs/sources.ts`). Las páginas estáticas/tools/legales
> conservan la hora de build/deploy. Para darle a un artículo una fecha precisa,
> agrega `updatedAt: "YYYY-MM-DD"` a su frontmatter MDX. La referencia de abajo
> explica los trade-offs.

**Problema original (antes del fix):** `app/sitemap.ts` sellaba **cada** URL con
`lastModified: now` (la hora de build/render):

```ts
const now = new Date();
// ...cada entrada recibe `now`
```

Eso hace que las 45 URLs siempre reporten "cambió hoy". La guía de Google es que
**usa `<lastmod>` solo cuando es consistentemente preciso**, y lo ignora en caso
contrario — así que hoy esa señal simplemente se desperdicia (no daña, solo es
inútil). Esto es **pulido, no la causa de ningún fallo de indexación.**

Para que sirva, dale a cada URL su fecha **real** de último cambio. Dos enfoques:

### Opción A — fecha en frontmatter (recomendada, determinista)

Agrega `updatedAt` al frontmatter MDX de cada doc y léelo en el sitemap:

```md
---
title: "Suplementos con evidencia"
updatedAt: "2026-06-16"
---
```

```ts
// app/sitemap.ts — docs
const docEntries = getDocSlugs("en").map((slug) => {
  const { updatedAt } = getDocMeta(slug, "en"); // expón updatedAt desde lib/docs
  return entry(`/docs/${slug}`, `/es/docs/${slug}`, 0.6, "monthly", updatedAt ?? now);
});
```

Pros: explícito, sin dependencia del entorno de build. Contras: lo actualizas a mano
al revisar un artículo (aceptable — es exactamente cuando `lastmod` debe cambiar).

### Opción B — fecha del commit de git (automática)

Deriva la fecha del último commit del archivo en build:

```ts
import { execSync } from "node:child_process";

const gitLastModified = (file: string): Date => {
  try {
    const iso = execSync(`git log -1 --format=%cI -- ${file}`, { encoding: "utf8" }).trim();
    return iso ? new Date(iso) : new Date();
  } catch {
    return new Date();
  }
};
```

Pros: cero mantenimiento, siempre preciso. Contras: necesita historial de git en
build — Vercel hace shallow clone por defecto, así que un `git log` de un solo
archivo normalmente funciona, pero verifícalo tras el primer deploy (cae a `now` si
devuelve vacío, como arriba).

### Páginas estáticas / tools / legales

No tienen fecha de contenido por página. Usa una **constante de fecha de deploy** (la
hora de build está bien, ya que cambian juntas en los deploys) en vez de un "now" por
URL. Si quieres precisión, aplica la Opción B a las rutas de su `page.tsx`.

**Recomendación:** Opción A para docs (el contenido que sí cambia), fecha-de-deploy
para el resto. O deja `now` si no quieres el mantenimiento — como Google ignora un
`lastmod` siempre-"now", da igual en costo.

## 4. Enviarlo a Google Search Console

1. Search Console → propiedad `metri.info` → **Sitemaps**.
2. En **"Añadir un sitemap"**, escribe solo la ruta: `sitemap.xml`. GSC antepone el
   dominio → `https://metri.info/sitemap.xml`. **Enviar.**
3. **No** envíes el dominio pelón (`https://metri.info`) — GSC lo rechaza con
   *"Dirección de sitemap no válida"* (no es un archivo sitemap, es una página).
4. Como `robots.txt` ya contiene `Sitemap: https://metri.info/sitemap.xml`, Google
   también lo descubrirá por su cuenta — el envío explícito solo lo acelera.

Luego, independiente del sitemap, **acelera la indexación** de las páginas que te
importan: **Inspección de URLs → escribe la URL → Solicitar indexación.** Hazlo con
la home y 2-3 páginas clave (`/tools`, una calculadora top). Esto dispara un rastreo
directo y no depende del estado del sitemap.

## 5. Solucionar los errores de GSC

### "El sitemap es HTML" / "Your sitemap appears to be an HTML page"

**Causa:** enviaste una URL que devuelve HTML en vez del archivo XML — casi siempre
la **home** (`https://metri.info/`) en lugar de `.../sitemap.xml`. GSC leyó la página,
vio `<html>` en la línea 1 y se rindió (0 páginas descubiertas).

**Fix:** borra esa entrada y envía `sitemap.xml` (ver [§4](#4-enviarlo-a-google-search-console)).
El sitio en sí está bien — es un error de envío.

### "No se ha podido obtener/leer" (Tipo: Desconocido)

**Causa (la más común):** *acabas* de enviarlo. GSC muestra muy seguido "No se ha
podido obtener" / tipo "Desconocido" en las primeras horas-a-días tras el envío, y
luego lo lee bien en el siguiente rastreo. "Última lectura = hoy" es la señal.

**Antes de preocuparte, descarta un problema real de fetch** con
[§6](#6-comandos-de-verificación): el archivo debe devolver `200` + `application/xml`,
ser XML válido y ser alcanzable por el user-agent de Googlebot (sin WAF/challenge de
bots). En metri.info todo esto pasa (200, `application/xml`, 45 URLs, Googlebot recibe
XML limpio, servido por Vercel en ~0.3s), así que la acción correcta es:

- **Espera 24-48 h y vuelve a revisar.** No reenvíes repetidamente — no ayuda y
  puede reiniciar el reloj.
- Confirma que puedes abrirlo con **"Abrir sitemap"** (cargará el XML).
- Si tras ~48 h sigue "No se ha podido obtener", borra y vuelve a añadir el sitemap
  **una vez**, y espera de nuevo.

**Otras causas reales a revisar** (no es nuestro caso, pero para el runbook): la URL
da 404; una cadena de redirecciones (http→https, loop de trailing-slash); el endpoint
devolvió un 5xx justo cuando Google lo pidió (deploy transitorio); o protección de
bots (challenge de Cloudflare/Vercel) sirviéndole a Googlebot una página de reto en
vez del XML.

## 6. Comandos de verificación

Corre esto para probar que el archivo es válido y alcanzable — la verdad de terreno
que GSC reporta con retraso:

```bash
# Estado + content-type (debe ser 200 + application/xml)
curl -sSL -o /dev/null -w "HTTP %{http_code} | %{content_type}\n" https://metri.info/sitemap.xml

# Las primeras líneas deben ser XML, no <html>
curl -sSL https://metri.info/sitemap.xml | head -3

# Alcanzable por el user-agent de Googlebot (descarta bloqueo de bots)
curl -sSL -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  -o /dev/null -w "HTTP %{http_code} | %{content_type}\n" https://metri.info/sitemap.xml

# Cuenta las URLs (sanity: coincide con app/sitemap.ts)
curl -sSL https://metri.info/sitemap.xml | grep -c "<loc>"

# robots.txt apunta al sitemap y no bloquea páginas públicas
curl -sSL https://metri.info/robots.txt
```

Valida también el XML con las herramientas de Google: la **Inspección de URLs** sobre
`https://metri.info/sitemap.xml`, o cualquier validador de sitemaps.

## 7. Notas que a Google sí le importan

- **`<changefreq>` y `<priority>` los ignora Google prácticamente por completo.**
  Déjalos o quítalos; no afectan el rastreo. `<lastmod>` es la única pista que puede
  importar — y solo si es preciso (ver [§3](#3-lastmodified--qué-es-y-cómo-ponerlo-bien)).
- **Consistencia de URLs.** El `<loc>` del sitemap, el `<link rel="canonical">` de la
  página, las alternativas `hreflang` y el `Host:` de `robots.txt` deben usar el mismo
  origen y forma. Detalle menor hoy: la home es `https://metri.info/` (con slash) en el
  sitemap pero `https://metri.info` (sin slash) en el canonical — Google lo normaliza,
  pero alinearlos es más limpio.
- **Sitio nuevo = indexación lenta.** Un dominio joven tarda semanas-a-meses en
  indexar sin importar el sitemap. El sitemap + `Solicitar indexación` aceleran el
  descubrimiento; no anulan la evaluación de ranking/calidad de Google.
- **Revisa el reporte de Páginas, no solo la pestaña de Sitemaps.** GSC →
  *Indexación de páginas* te dice si las URLs están *Descubierta – no indexada* o
  *Rastreada – no indexada* (una cuestión de contenido/calidad/crawl-budget) versus
  realmente indexadas. Ahí te enteras si las páginas están aterrizando, una vez que el
  sitemap se lea bien.

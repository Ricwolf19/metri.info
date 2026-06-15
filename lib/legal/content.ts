import type { Locale } from "@/lib/i18n/config";

/**
 * Long-form bilingual copy for the static legal / about pages. Kept as a
 * content module (like `lib/calculators/content.ts`) rather than flat i18n keys
 * because it is prose, not UI labels. `body` entries are paragraphs.
 */
export type LegalDoc = "about" | "privacy" | "terms";

type Section = { heading: string; body: string[] };
export type LegalContent = {
  title: string;
  lead: string;
  updated: string;
  sections: Section[];
};

export const LEGAL_CONTENT: Record<LegalDoc, Record<Locale, LegalContent>> = {
  about: {
    en: {
      title: "About METRI",
      lead: "METRI is a free, open-source toolkit for people who take training seriously — accurate calculators and evidence-based guides, with no paywalls and no clutter.",
      updated: "",
      sections: [
        {
          heading: "What METRI is",
          body: [
            "METRI is web-first. Every calculator — 1RM, TDEE, macros, body fat, BMI, FFMI, hydration and plate loading — runs instantly in your browser, free, forever. Alongside them is a growing knowledge base of practical, no-nonsense guides on nutrition, training and recovery.",
            "A native iOS and Android app is in development as an optional extra: the same tools, fully offline, with progress tracking and reminders. You never need it to use METRI — the web is the product.",
          ],
        },
        {
          heading: "Free and open source",
          body: [
            "METRI is MIT-licensed and developed in the open. There are no subscriptions, no locked features and no ads. You can read the code, file issues, suggest features or fork it entirely.",
            "Keeping it open keeps it honest: the formulas behind every result are inspectable, so you can trust what the numbers mean.",
          ],
        },
        {
          heading: "Private by design",
          body: [
            "The calculators do their math locally — your numbers stay in your browser. An account is optional and only exists to sync saved results across devices and with the app.",
          ],
        },
        {
          heading: "Who builds it",
          body: [
            "METRI is built and maintained independently. Contributions are welcome — the best place to get involved is the GitHub repository.",
          ],
        },
      ],
    },
    es: {
      title: "Acerca de METRI",
      lead: "METRI es un conjunto de herramientas gratuito y de código abierto para quienes se toman el entrenamiento en serio: calculadoras precisas y guías basadas en evidencia, sin muros de pago ni distracciones.",
      updated: "",
      sections: [
        {
          heading: "Qué es METRI",
          body: [
            "METRI es, ante todo, web. Todas las calculadoras —1RM, TDEE, macros, grasa corporal, IMC, FFMI, hidratación y carga de discos— funcionan al instante en tu navegador, gratis y para siempre. Junto a ellas hay una base de conocimiento en crecimiento con guías prácticas y directas sobre nutrición, entrenamiento y recuperación.",
            "Una app nativa para iOS y Android está en desarrollo como un extra opcional: las mismas herramientas, totalmente sin conexión, con seguimiento de progreso y recordatorios. Nunca la necesitas para usar METRI: la web es el producto.",
          ],
        },
        {
          heading: "Gratis y de código abierto",
          body: [
            "METRI tiene licencia MIT y se desarrolla de forma abierta. No hay suscripciones, ni funciones bloqueadas, ni anuncios. Puedes leer el código, reportar problemas, sugerir funciones o hacer un fork completo.",
            "Mantenerlo abierto lo mantiene honesto: las fórmulas detrás de cada resultado son inspeccionables, así puedes confiar en lo que significan los números.",
          ],
        },
        {
          heading: "Privado por diseño",
          body: [
            "Las calculadoras hacen sus cálculos localmente: tus datos se quedan en tu navegador. La cuenta es opcional y solo existe para sincronizar resultados guardados entre dispositivos y con la app.",
          ],
        },
        {
          heading: "Quién lo construye",
          body: [
            "METRI se construye y mantiene de forma independiente. Las contribuciones son bienvenidas; el mejor lugar para participar es el repositorio de GitHub.",
          ],
        },
      ],
    },
  },

  privacy: {
    en: {
      title: "Privacy Policy",
      lead: "We collect as little as possible. The calculators work without an account, and we never sell your data.",
      updated: "Last updated: June 2026",
      sections: [
        {
          heading: "Calculators run locally",
          body: [
            "All calculator inputs and results are processed in your browser. They are not sent to or stored on our servers. The values appear in the page URL only so you can copy and share a result link — nothing more.",
          ],
        },
        {
          heading: "Accounts (optional)",
          body: [
            "If you create an account, we store the minimum needed to provide it: your email address, an optional display name, and the results you choose to save. Authentication is handled by Better Auth. If you sign in with Google or GitHub, we receive your basic profile (email and name) from that provider — never your password.",
            "You can delete your account at any time, which removes your saved data.",
          ],
        },
        {
          heading: "Analytics",
          body: [
            "We may use privacy-friendly, aggregate analytics to understand which pages are useful. These measure traffic in aggregate and are not used to build advertising profiles. Analytics are disabled in development.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "We use only essential cookies: your theme and language preferences, and — if you sign in — your authentication session. No third-party advertising cookies are set.",
          ],
        },
        {
          heading: "Your rights and contact",
          body: [
            "You can access, export or delete your account data. For any privacy request or question, open an issue on the GitHub repository and we will respond.",
          ],
        },
        {
          heading: "Children",
          body: [
            "METRI is not directed at children under 13, and we do not knowingly collect their data.",
          ],
        },
      ],
    },
    es: {
      title: "Política de Privacidad",
      lead: "Recopilamos lo mínimo posible. Las calculadoras funcionan sin cuenta y nunca vendemos tus datos.",
      updated: "Última actualización: junio de 2026",
      sections: [
        {
          heading: "Las calculadoras funcionan localmente",
          body: [
            "Todos los datos y resultados de las calculadoras se procesan en tu navegador. No se envían ni se almacenan en nuestros servidores. Los valores aparecen en la URL de la página solo para que puedas copiar y compartir un enlace con el resultado, nada más.",
          ],
        },
        {
          heading: "Cuentas (opcional)",
          body: [
            "Si creas una cuenta, almacenamos lo mínimo necesario para ofrecerla: tu correo electrónico, un nombre opcional y los resultados que decidas guardar. La autenticación la gestiona Better Auth. Si inicias sesión con Google o GitHub, recibimos tu perfil básico (correo y nombre) de ese proveedor, nunca tu contraseña.",
            "Puedes eliminar tu cuenta en cualquier momento, lo que borra tus datos guardados.",
          ],
        },
        {
          heading: "Analítica",
          body: [
            "Podemos usar analítica agregada y respetuosa con la privacidad para entender qué páginas son útiles. Mide el tráfico de forma agregada y no se usa para crear perfiles publicitarios. La analítica está desactivada en desarrollo.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "Solo usamos cookies esenciales: tus preferencias de tema e idioma y, si inicias sesión, tu sesión de autenticación. No se establecen cookies publicitarias de terceros.",
          ],
        },
        {
          heading: "Tus derechos y contacto",
          body: [
            "Puedes acceder, exportar o eliminar los datos de tu cuenta. Para cualquier solicitud o duda sobre privacidad, abre un issue en el repositorio de GitHub y te responderemos.",
          ],
        },
        {
          heading: "Menores",
          body: [
            "METRI no está dirigido a menores de 13 años y no recopilamos sus datos de forma consciente.",
          ],
        },
      ],
    },
  },

  terms: {
    en: {
      title: "Terms of Service",
      lead: "The short version: METRI is free, provided as-is, and is not medical advice. Use your judgment.",
      updated: "Last updated: June 2026",
      sections: [
        {
          heading: "Acceptance",
          body: [
            "By using METRI you agree to these terms. If you do not agree, please do not use the service.",
          ],
        },
        {
          heading: "Not medical advice",
          body: [
            "METRI's calculators and guides are for educational and informational purposes only. They are estimates based on published formulas and are not a substitute for professional medical, nutritional or fitness advice. Consult a qualified professional before making decisions about your health or training.",
          ],
        },
        {
          heading: "Provided “as is”",
          body: [
            "The service is provided without warranties of any kind. We do not guarantee that results are accurate for your individual circumstances or that the service will be uninterrupted or error-free. To the extent permitted by law, we are not liable for any loss arising from your use of METRI.",
          ],
        },
        {
          heading: "Your account",
          body: [
            "If you create an account, you are responsible for keeping access to it secure and for the activity that happens under it. Don't use METRI to break the law or to disrupt the service for others.",
          ],
        },
        {
          heading: "Open-source license",
          body: [
            "The METRI source code is released under the MIT License. Your use of the code is governed by that license, which is available in the repository.",
          ],
        },
        {
          heading: "Changes",
          body: [
            "We may update these terms as the project evolves. Material changes will be reflected by the “last updated” date above. Questions can be raised on the GitHub repository.",
          ],
        },
      ],
    },
    es: {
      title: "Términos del Servicio",
      lead: "La versión corta: METRI es gratis, se ofrece tal cual y no es consejo médico. Usa tu criterio.",
      updated: "Última actualización: junio de 2026",
      sections: [
        {
          heading: "Aceptación",
          body: [
            "Al usar METRI aceptas estos términos. Si no estás de acuerdo, por favor no uses el servicio.",
          ],
        },
        {
          heading: "No es consejo médico",
          body: [
            "Las calculadoras y guías de METRI tienen fines únicamente educativos e informativos. Son estimaciones basadas en fórmulas publicadas y no sustituyen el consejo profesional médico, nutricional o deportivo. Consulta a un profesional cualificado antes de tomar decisiones sobre tu salud o entrenamiento.",
          ],
        },
        {
          heading: "Se ofrece “tal cual”",
          body: [
            "El servicio se ofrece sin garantías de ningún tipo. No garantizamos que los resultados sean exactos para tus circunstancias individuales ni que el servicio sea ininterrumpido o esté libre de errores. En la medida que permita la ley, no somos responsables de ninguna pérdida derivada del uso de METRI.",
          ],
        },
        {
          heading: "Tu cuenta",
          body: [
            "Si creas una cuenta, eres responsable de mantener su acceso seguro y de la actividad que ocurra en ella. No uses METRI para infringir la ley ni para perjudicar el servicio a otros.",
          ],
        },
        {
          heading: "Licencia de código abierto",
          body: [
            "El código fuente de METRI se publica bajo la Licencia MIT. Tu uso del código se rige por esa licencia, disponible en el repositorio.",
          ],
        },
        {
          heading: "Cambios",
          body: [
            "Podemos actualizar estos términos a medida que el proyecto evoluciona. Los cambios importantes se reflejarán en la fecha de “última actualización” de arriba. Las dudas pueden plantearse en el repositorio de GitHub.",
          ],
        },
      ],
    },
  },
};

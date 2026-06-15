import type { Metadata } from "next";

import { ContactView } from "@/components/contact/ContactView";
import { translate } from "@/lib/i18n/config";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: translate("es", "contact.title"),
  description: translate("es", "contact.subtitle"),
  alternates: metaAlternates("contact", "es"),
};

const ContactoPage = () => <ContactView locale="es" />;

export default ContactoPage;

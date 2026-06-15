import type { Metadata } from "next";

import { ContactView } from "@/components/contact/ContactView";
import { translate } from "@/lib/i18n/config";
import { metaAlternates } from "@/lib/i18n/routes";

export const metadata: Metadata = {
  title: translate("en", "contact.title"),
  description: translate("en", "contact.subtitle"),
  alternates: metaAlternates("contact", "en"),
};

const ContactPage = () => <ContactView locale="en" />;

export default ContactPage;

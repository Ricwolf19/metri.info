import type { Metadata } from "next";

import { ContactView } from "@/components/contact/ContactView";
import { sectionMetadata } from "@/lib/seo/pages";

export const metadata: Metadata = sectionMetadata("contact", "es");

const ContactoPage = () => <ContactView locale="es" />;

export default ContactoPage;

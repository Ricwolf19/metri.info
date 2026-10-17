import type { Metadata } from "next";

import { ContactView } from "@/components/contact/ContactView";
import { sectionMetadata } from "@/lib/seo/pages";

export const metadata: Metadata = sectionMetadata("contact", "en");

const ContactPage = () => <ContactView locale="en" />;

export default ContactPage;

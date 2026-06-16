import { ServicesGrid } from "@/components/admin/ServicesGrid";
import { PageHeader } from "@/components/admin/ui";

const ServicesPage = () => (
  <>
    <PageHeader
      title="Services"
      description="External consoles that own each metric. Each opens in a new tab; integrations show whether their environment is configured (booleans only — no secrets are displayed)."
    />
    <ServicesGrid />
  </>
);

export default ServicesPage;

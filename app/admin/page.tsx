import { Overview } from "@/components/admin/Overview";
import { PageHeader } from "@/components/admin/ui";

const AdminPage = () => (
  <>
    <PageHeader
      title="Overview"
      description="One number per source up top, then the first-party series, when the site is used, and the top lists. Each card degrades on its own; drilldowns live under Analytics."
    />
    <Overview />
  </>
);

export default AdminPage;

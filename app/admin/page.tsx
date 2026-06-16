import { Overview } from "@/components/admin/Overview";
import { PageHeader } from "@/components/admin/ui";

const AdminPage = () => (
  <>
    <PageHeader
      title="Overview"
      description="First-party metrics aggregated from the database: registered users, active sessions, saved calculations and favorites."
    />
    <Overview />
  </>
);

export default AdminPage;

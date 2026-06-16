import { PageHeader } from "@/components/admin/ui";
import { UsersTable } from "@/components/admin/UsersTable";

const UsersPage = () => (
  <>
    <PageHeader
      title="Users"
      description="Registered accounts, newest first. Read-only — name, email, role, email verification and join date."
    />
    <UsersTable />
  </>
);

export default UsersPage;

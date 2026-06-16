import type { Metadata } from "next";

// Never index the admin area, and don't render the marketing chrome (the
// Header/Footer hide on /admin via isChromelessPath).
export const metadata: Metadata = {
  title: "Admin · METRI",
  robots: { index: false, follow: false },
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-dvh bg-ink-900">{children}</div>
);

export default AdminLayout;

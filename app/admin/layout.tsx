import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Admin · Metri",
  robots: { index: false, follow: false },
};

/**
 * Admin gate. Guards every /admin/* route in one place via requireAdmin() and
 * frames children in the standard content width. The navigation is the site
 * header: on admin paths it swaps its sections for the admin ones (see
 * `components/layout/Header.tsx`), so there is no second sidebar to learn.
 *
 * Split from `AdminLayout` so the session read (which touches `headers()`) sits
 * inside a Suspense boundary; a layout awaiting runtime data would otherwise
 * block every route below it from prerendering under Cache Components.
 */
const AdminGate = async ({ children }: { children: React.ReactNode }) => {
  await requireAdmin();
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8 lg:py-10">
      {children}
    </div>
  );
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingScreen variant="route" label="Loading admin…" />}>
    <AdminGate>{children}</AdminGate>
  </Suspense>
);

export default AdminLayout;

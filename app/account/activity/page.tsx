import type { Metadata } from "next";

import { ActivityView } from "@/components/account/ActivityView";
import { requireUser } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "My activity · Metri",
  robots: { index: false, follow: false },
};

const ActivityPage = async (props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const user = await requireUser();
  const historyParams = await props.searchParams;

  return (
    <ActivityView
      userId={user.id}
      plan={(user as { plan?: string | null }).plan}
      locale="en"
      historyParams={historyParams}
    />
  );
};

export default ActivityPage;

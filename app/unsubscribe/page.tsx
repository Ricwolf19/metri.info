import type { Metadata } from "next";

import { UnsubscribeView } from "@/components/account/UnsubscribeView";
import { createT } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: createT("en")("unsubscribe.metaTitle"),
  robots: { index: false, follow: false },
};

const UnsubscribePage = ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => <UnsubscribeView locale="en" searchParams={searchParams} />;

export default UnsubscribePage;

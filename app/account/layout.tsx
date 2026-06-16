import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My account · Metri",
  robots: { index: false, follow: false },
};

const AccountLayout = ({ children }: { children: React.ReactNode }) => children;

export default AccountLayout;

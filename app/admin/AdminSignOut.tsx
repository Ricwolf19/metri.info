"use client";

import { useRouter } from "next/navigation";

import { LogOutIcon } from "@/components/icons";
import { signOut } from "@/lib/auth/client";

export const AdminSignOut = () => {
  const router = useRouter();
  const onClick = () => signOut().finally(() => router.push("/sign-in"));

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-700 hover:text-ink-50"
    >
      <LogOutIcon size={15} />
      Sign out
    </button>
  );
};

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { LogOutIcon } from "@/components/icons";
import { Spinner } from "@/components/ui/Spinner";
import { signOut } from "@/lib/auth/client";

export const AdminSignOut = () => {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const onClick = () => {
    if (signingOut) return;
    setSigningOut(true);
    signOut().finally(() => router.push("/sign-in"));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={signingOut}
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-700 hover:text-ink-50 disabled:opacity-60"
    >
      {signingOut ? <Spinner size="sm" /> : <LogOutIcon size={15} />}
      {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
};

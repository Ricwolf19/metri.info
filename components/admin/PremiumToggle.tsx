"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { setUserPremium } from "@/lib/admin/actions";

/** Admin per-user premium toggle. Optimistic; reverts if the action fails. */
export const PremiumToggle = ({
  userId,
  plan,
}: {
  userId: string;
  plan: string;
}) => {
  const [isPremium, setIsPremium] = useState(plan === "premium");
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !isPremium;
    setIsPremium(next);
    startTransition(async () => {
      const res = await setUserPremium(userId, next);
      if (!res.ok) setIsPremium(!next);
    });
  };

  return (
    <Button
      type="button"
      size="sm"
      variant={isPremium ? "brand" : "outline"}
      loading={pending}
      onClick={toggle}
    >
      {isPremium ? "Premium" : "Free"}
    </Button>
  );
};

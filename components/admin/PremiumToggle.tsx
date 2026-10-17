"use client";

import { useListRefresh } from "listkit";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { REASON_MESSAGE } from "@/components/admin/DeleteUserButton";
import { setUserPremium } from "@/lib/admin/actions";

/** Admin per-user premium toggle. Optimistic; reverts if the action fails. */
export const PremiumToggle = ({
  userId,
  plan,
}: {
  userId: string;
  plan: string;
}) => {
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(plan === "premium");
  const [pending, startTransition] = useTransition();
  const refreshList = useListRefresh();

  const toggle = () => {
    const next = !isPremium;
    setIsPremium(next);
    startTransition(async () => {
      const res = await setUserPremium(userId, next);
      if (res.ok) {
        // listkit caches pages for 30 s; without this the row remounts with
        // the old plan after a filter change or a back navigation.
        refreshList();
      } else {
        setIsPremium(!next);
        toast({
          title: "Couldn't update the plan",
          description: REASON_MESSAGE[res.reason],
          variant: "error",
        });
      }
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

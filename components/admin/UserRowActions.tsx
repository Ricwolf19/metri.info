"use client";

import {
  DeleteUserButton,
  REASON_MESSAGE,
} from "@/components/admin/DeleteUserButton";
import { PremiumToggle } from "@/components/admin/PremiumToggle";
import { useSession } from "@/lib/auth/client";
import type { AdminUserRow } from "@/lib/lists/users";

/** The per-row admin controls: plan toggle and hard delete. Self and other
 * admins can't be deleted, and the reason is the button's tooltip. */
export const UserRowActions = ({ user }: { user: AdminUserRow }) => {
  const { data } = useSession();
  const me = data?.user.id;
  const disabledReason =
    user.id === me
      ? REASON_MESSAGE.self
      : user.role === "admin"
        ? REASON_MESSAGE.admin_protected
        : undefined;
  return (
    <div className="flex items-center justify-end gap-2">
      <PremiumToggle userId={user.id} plan={user.plan} />
      <DeleteUserButton
        userId={user.id}
        email={user.email}
        disabledReason={disabledReason}
      />
    </div>
  );
};

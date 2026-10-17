"use client";

import { useListRefresh } from "listkit";
import { useState, useTransition } from "react";

import { TrashIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { type AdminFailReason, deleteUser } from "@/lib/admin/actions";

const REMOVED = [
  "The account and its sign-in methods",
  "Profile and body metrics",
  "Saved calculations",
  "Favorites",
  "Synced training, body and food data",
  "Active sessions on every device",
];

/** Human copy per refusal — exhaustive, so a new reason is a compile error. */
export const REASON_MESSAGE: Record<AdminFailReason, string> = {
  unauthenticated: "Your session expired. Sign in again.",
  forbidden: "Only admins can delete users.",
  self: "You can't delete your own account.",
  not_found: "That user no longer exists.",
  admin_protected: "Admins can't be deleted from here.",
  email_mismatch: "The email you typed doesn't match.",
  failed: "The database refused the change. Please try again.",
};

/**
 * Hard-delete a user behind a typed-email confirmation. The server re-checks
 * everything (role, self, admin target, email) — the client gating is only so
 * the button reads as unavailable where it is.
 */
export const DeleteUserButton = ({
  userId,
  email,
  disabledReason,
}: {
  userId: string;
  email: string;
  /** Why the control is unavailable (self / other admin); omitted = enabled. */
  disabledReason?: string;
}) => {
  const refreshList = useListRefresh();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, startTransition] = useTransition();
  const matches = typed.trim().toLowerCase() === email.toLowerCase();

  const confirm = () => {
    startTransition(async () => {
      const res = await deleteUser(userId, typed);
      if (res.ok) {
        setOpen(false);
        toast({ title: `Deleted ${email}`, variant: "success" });
        refreshList();
        return;
      }
      toast({
        title: "Couldn't delete the user",
        description: REASON_MESSAGE[res.reason],
        variant: "error",
      });
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Delete ${email}`}
        title={disabledReason ?? "Delete user"}
        disabled={Boolean(disabledReason)}
        onClick={() => {
          setTyped("");
          setOpen(true);
        }}
        className="text-ink-400 hover:bg-red-500/10 hover:text-red-400"
      >
        <TrashIcon size={16} />
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!pending) setOpen(next);
        }}
      >
        <DialogContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <DialogTitle className="break-all">Delete {email}?</DialogTitle>
            <DialogDescription>
              This removes the account permanently. There is no undo.
            </DialogDescription>
          </div>

          <ul className="space-y-1.5 text-sm text-ink-300">
            {REMOVED.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-red-400" />
                {item}
              </li>
            ))}
          </ul>

          <div className="space-y-1.5">
            <Label htmlFor={`confirm-${userId}`}>
              Type the user&apos;s email to confirm
            </Label>
            <Input
              id={`confirm-${userId}`}
              autoComplete="off"
              spellCheck={false}
              placeholder={email}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={!matches}
              loading={pending}
              onClick={confirm}
            >
              Delete user
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

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
import { useToast } from "@/components/ui/toast";
import { useT } from "@/lib/i18n";
import { deleteMyCalculation } from "@/app/account/activity/actions";

/** The per-row control of the history list: a trash icon that asks once,
 * deletes the row and refreshes the page it sits on. */
export const HistoryRowActions = ({ id }: { id: string }) => {
  const t = useT();
  const { toast } = useToast();
  const refreshList = useListRefresh();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const confirm = () => {
    startTransition(async () => {
      const res = await deleteMyCalculation(id);
      if (res.ok) {
        setOpen(false);
        toast({ title: t("history.deleted"), variant: "success" });
        refreshList();
        return;
      }
      toast({ title: t("history.deleteFailed"), variant: "error" });
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t("history.delete")}
        title={t("history.delete")}
        onClick={() => setOpen(true)}
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
            <DialogTitle>{t("history.deleteTitle")}</DialogTitle>
            <DialogDescription>{t("history.deleteBody")}</DialogDescription>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={confirm}
            >
              {t("history.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

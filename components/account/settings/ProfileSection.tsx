"use client";

import { useState } from "react";

import {
  FieldGrid,
  PanelStatus,
  SettingsPanel,
} from "@/components/account/settings/SettingsPanel";
import { AuthInput } from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { track } from "@/lib/analytics/track";
import { useT } from "@/lib/i18n";
import { type ProfileInput, saveProfile } from "@/app/account/settings/actions";
import type { AccountProfile } from "@/lib/account/settings";

const SEX_OPTIONS = [
  { value: "unset", key: "settings.sexUnset" },
  { value: "male", key: "settings.sexMale" },
  { value: "female", key: "settings.sexFemale" },
] as const;

const ACTIVITY_OPTIONS = [
  { value: "unset", key: "settings.activityUnset" },
  { value: "sedentary", key: "settings.activitySedentary" },
  { value: "light", key: "settings.activityLight" },
  { value: "moderate", key: "settings.activityModerate" },
  { value: "active", key: "settings.activityActive" },
  { value: "athlete", key: "settings.activityAthlete" },
] as const;

const numStr = (n: number | null | undefined) =>
  n === null || n === undefined ? "" : String(n);

export const ProfileSection = ({
  id,
  initialName,
  profile,
}: {
  id: string;
  initialName: string;
  profile: AccountProfile | null;
}) => {
  const t = useT();
  const { toast } = useToast();

  const [name, setName] = useState(initialName);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [units, setUnits] = useState(profile?.unitsPreference ?? "kg");
  const [sex, setSex] = useState(profile?.sex ?? "unset");
  const [activity, setActivity] = useState(profile?.activityLevel ?? "unset");
  const [weight, setWeight] = useState(numStr(profile?.bodyWeightKg));
  const [height, setHeight] = useState(numStr(profile?.bodyHeightCm));

  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setPending(true);
    const input: ProfileInput = {
      name,
      displayName,
      bio,
      unitsPreference: units,
      sex: sex === "unset" ? null : sex,
      activityLevel: activity === "unset" ? null : activity,
      bodyWeightKg: weight,
      bodyHeightCm: height,
    };
    const res = await saveProfile(input);
    setPending(false);
    if (res.ok) {
      setStatus({ tone: "success", message: t("settings.profileSaved") });
      track("profile_saved");
      toast({ title: t("toast.profileSaved"), variant: "success" });
    } else {
      setStatus({ tone: "error", message: res.error.message });
      toast({
        title: t("toast.profileError"),
        description: res.error.message,
        variant: "error",
      });
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <SettingsPanel
        id={id}
        title={t("settings.profileTitle")}
        description={t("settings.profileDesc")}
        footer={
          <>
            <PanelStatus
              message={status?.message ?? null}
              tone={status?.tone ?? "success"}
            />
            <Button type="submit" size="sm" loading={pending}>
              {pending ? t("settings.saving") : t("settings.save")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FieldGrid>
            <AuthInput
              label={t("settings.name")}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <AuthInput
              label={t("settings.displayName")}
              placeholder={t("settings.displayNamePlaceholder")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </FieldGrid>

          <AuthInput
            label={t("settings.bio")}
            placeholder={t("settings.bioPlaceholder")}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <FieldGrid>
            <div>
              <Label className="mb-1.5 block">{t("settings.units")}</Label>
              <Select value={units} onValueChange={setUnits}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">{t("settings.unitsKg")}</SelectItem>
                  <SelectItem value="lb">{t("settings.unitsLb")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">{t("settings.sex")}</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEX_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {t(o.key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldGrid>

          <FieldGrid>
            <div>
              <Label className="mb-1.5 block">
                {t("settings.activityLevel")}
              </Label>
              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {t(o.key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <AuthInput
                label={t("settings.bodyWeight")}
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <AuthInput
                label={t("settings.bodyHeight")}
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </FieldGrid>
        </div>
      </SettingsPanel>
    </form>
  );
};

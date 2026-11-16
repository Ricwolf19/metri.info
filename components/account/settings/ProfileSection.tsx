"use client";

import { useState } from "react";
import { type Control, Controller, useForm } from "react-hook-form";

import {
  FieldGrid,
  PanelStatus,
  SettingsPanel,
} from "@/components/account/settings/SettingsPanel";
import { AuthInput } from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Segmented } from "@/components/ui/segmented";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { type ProfileInput, saveProfile } from "@/app/account/settings/actions";
import { ACTIVITY_LEVELS, BMR_FORMULAS, SEXES } from "@/lib/account/options";
import type { AccountProfile } from "@/lib/account/settings";

const UNSET = "unset";

type Option = {
  value: string;
  key: TranslationKey;
  /** One line under the label explaining the choice. */
  descKey?: TranslationKey;
};

/** Labels per option value. `Record` over the shared sets keeps the form and
 * the save action's whitelist in lockstep: add a level in `options.ts` and
 * this fails to compile until it has a label. */
const SEX_KEY: Record<(typeof SEXES)[number], TranslationKey> = {
  male: "settings.sexMale",
  female: "settings.sexFemale",
};
const ACTIVITY_KEY: Record<(typeof ACTIVITY_LEVELS)[number], TranslationKey> = {
  sedentary: "settings.activitySedentary",
  light: "settings.activityLight",
  moderate: "settings.activityModerate",
  active: "settings.activityActive",
  very_active: "settings.activityVeryActive",
};
const ACTIVITY_DESC_KEY: Record<
  (typeof ACTIVITY_LEVELS)[number],
  TranslationKey
> = {
  sedentary: "activity.sedentary.desc",
  light: "activity.light.desc",
  moderate: "activity.moderate.desc",
  active: "activity.active.desc",
  very_active: "activity.veryActive.desc",
};
const FORMULA_KEY: Record<(typeof BMR_FORMULAS)[number], TranslationKey> = {
  mifflin_st_jeor: "calc.formula.mifflin",
  harris_benedict: "calc.formula.harris",
  katch_mcardle: "calc.formula.katch",
};

const withUnset = <T extends string>(
  unsetKey: TranslationKey,
  values: readonly T[],
  keys: Record<T, TranslationKey>,
  descs?: Record<T, TranslationKey>,
): Option[] => [
  { value: UNSET, key: unsetKey },
  ...values.map((value) => ({
    value,
    key: keys[value],
    descKey: descs?.[value],
  })),
];

const SEX_OPTIONS = withUnset("settings.sexUnset", SEXES, SEX_KEY);
/** A legacy web-only "athlete" row is read as `very_active` so it keeps
 * prefilling the calculators. */
const ACTIVITY_OPTIONS = withUnset(
  "settings.activityUnset",
  ACTIVITY_LEVELS,
  ACTIVITY_KEY,
  ACTIVITY_DESC_KEY,
);
const FORMULA_OPTIONS = withUnset(
  "settings.formulaUnset",
  BMR_FORMULAS,
  FORMULA_KEY,
);

const numStr = (n: number | null | undefined) =>
  n === null || n === undefined ? "" : String(n);

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <Label className="mb-1.5 block">{label}</Label>
    {children}
  </div>
);

type ProfileForm = {
  name: string;
  displayName: string;
  bio: string;
  units: "kg" | "lb";
  sex: string;
  age: string;
  activity: string;
  weight: string;
  height: string;
  bodyFat: string;
  formula: string;
  clock: "24" | "12";
  appLocale: "en" | "es";
};

/** The stored profile as form values: empty strings and `unset` for what
 * was never answered, so "unchanged" compares like with like. */
const toForm = (
  initialName: string,
  profile: AccountProfile | null,
): ProfileForm => ({
  name: initialName,
  displayName: profile?.displayName ?? "",
  bio: profile?.bio ?? "",
  units: profile?.unitsPreference === "lb" ? "lb" : "kg",
  sex: profile?.sex ?? UNSET,
  age: numStr(profile?.age),
  activity:
    profile?.activityLevel === "athlete"
      ? "very_active"
      : (profile?.activityLevel ?? UNSET),
  weight: numStr(profile?.bodyWeightKg),
  height: numStr(profile?.bodyHeightCm),
  bodyFat: numStr(profile?.bodyFatPct),
  formula: profile?.bmrFormula ?? UNSET,
  clock: profile?.clockFormat === "12" ? "12" : "24",
  appLocale: profile?.locale === "es" ? "es" : "en",
});

const unsetToNull = (v: string) => (v === UNSET ? null : v);

/** Form values → the save action's input (it validates and normalises). */
const toInput = (v: ProfileForm): ProfileInput => ({
  name: v.name,
  displayName: v.displayName,
  bio: v.bio,
  unitsPreference: v.units,
  sex: unsetToNull(v.sex),
  age: v.age,
  activityLevel: unsetToNull(v.activity),
  bodyWeightKg: v.weight,
  bodyHeightCm: v.height,
  bodyFatPct: v.bodyFat,
  bmrFormula: unsetToNull(v.formula),
  clockFormat: v.clock,
  locale: v.appLocale,
});

const ControlledSelect = ({
  control,
  name,
  label,
  options,
}: {
  control: Control<ProfileForm>;
  name: "sex" | "activity" | "formula";
  /** The trigger is a button: its name, since a <label> can't point at it. */
  label: string;
  options: readonly Option[];
}) => {
  const t = useT();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger aria-label={label} onBlur={field.onBlur}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem
                key={o.value}
                value={o.value}
                description={o.descKey ? t(o.descKey) : undefined}
              >
                {t(o.key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
};

/**
 * Profile panel — identity, the body metrics that prefill the calculators and
 * the app preferences the mobile client restores after a reinstall. Every
 * field here is one the app also reads or writes through `/api/profile`.
 */
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

  const defaultValues = toForm(initialName, profile);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm({ defaultValues });
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  // Save stays off until a value really differs from what's stored (typing
  // and undoing counts as unchanged), and a successful save becomes the new
  // baseline, so the same values are never written twice.
  const onSubmit = handleSubmit(async (values) => {
    setStatus(null);
    const res = await saveProfile(toInput(values));
    if (res.ok) {
      reset(values);
      setStatus({ tone: "success", message: t("settings.profileSaved") });
      toast({ title: t("toast.profileSaved"), variant: "success" });
    } else {
      setStatus({ tone: "error", message: res.error.message });
      toast({
        title: t("toast.profileError"),
        description: res.error.message,
        variant: "error",
      });
    }
  });

  const energy =
    profile?.latestTdee || profile?.latestBmr
      ? {
          tdee: profile.latestTdee,
          bmr: profile.latestBmr,
        }
      : null;

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
            <Button
              type="submit"
              size="sm"
              loading={isSubmitting}
              disabled={!isDirty}
            >
              {isSubmitting ? t("settings.saving") : t("settings.save")}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <section className="space-y-4">
            <FieldGrid>
              <AuthInput
                label={t("settings.name")}
                required
                {...register("name", { required: true })}
              />
              <AuthInput
                label={t("settings.displayName")}
                placeholder={t("settings.displayNamePlaceholder")}
                {...register("displayName")}
              />
            </FieldGrid>
            <AuthInput
              label={t("settings.bio")}
              placeholder={t("settings.bioPlaceholder")}
              {...register("bio")}
            />
          </section>

          <section className="space-y-4 border-t border-ink-700 pt-6">
            <div>
              <h3 className="text-sm font-semibold text-ink-50">
                {t("settings.bodyTitle")}
              </h3>
              <p className="mt-0.5 text-xs text-ink-400">
                {t("settings.bodyDesc")}
              </p>
            </div>
            <FieldGrid>
              <Field label={t("settings.sex")}>
                <ControlledSelect
                  control={control}
                  name="sex"
                  label={t("settings.sex")}
                  options={SEX_OPTIONS}
                />
              </Field>
              <AuthInput
                label={t("settings.age")}
                type="number"
                inputMode="numeric"
                min={10}
                max={120}
                step="1"
                {...register("age")}
              />
            </FieldGrid>
            <FieldGrid>
              <AuthInput
                label={t("settings.bodyWeight")}
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                {...register("weight")}
              />
              <AuthInput
                label={t("settings.bodyHeight")}
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                {...register("height")}
              />
            </FieldGrid>
            <FieldGrid>
              <AuthInput
                label={t("settings.bodyFat")}
                type="number"
                inputMode="decimal"
                min={2}
                max={70}
                step="0.1"
                {...register("bodyFat")}
              />
              <Field label={t("settings.activityLevel")}>
                <ControlledSelect
                  control={control}
                  name="activity"
                  label={t("settings.activityLevel")}
                  options={ACTIVITY_OPTIONS}
                />
              </Field>
            </FieldGrid>
            <Field label={t("settings.bmrFormula")}>
              <ControlledSelect
                control={control}
                name="formula"
                label={t("settings.bmrFormula")}
                options={FORMULA_OPTIONS}
              />
            </Field>
            {energy && (
              <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-field border border-ink-600/70 bg-ink-900/40 px-4 py-3 font-mono text-xs text-ink-300">
                <span className="text-ink-400">
                  {t("settings.energySnapshot")}
                </span>
                {energy.tdee ? (
                  <span>
                    TDEE{" "}
                    <span className="text-ink-50">
                      {Math.round(energy.tdee)}
                    </span>{" "}
                    kcal
                  </span>
                ) : null}
                {energy.bmr ? (
                  <span>
                    BMR{" "}
                    <span className="text-ink-50">
                      {Math.round(energy.bmr)}
                    </span>{" "}
                    kcal
                  </span>
                ) : null}
              </div>
            )}
          </section>

          <section className="space-y-4 border-t border-ink-700 pt-6">
            <div>
              <h3 className="text-sm font-semibold text-ink-50">
                {t("settings.prefsTitle")}
              </h3>
              <p className="mt-0.5 text-xs text-ink-400">
                {t("settings.prefsDesc")}
              </p>
            </div>
            <FieldGrid>
              <Field label={t("settings.units")}>
                <Controller
                  control={control}
                  name="units"
                  render={({ field }) => (
                    <Segmented
                      value={field.value}
                      onValueChange={field.onChange}
                      options={[
                        { value: "kg", label: t("settings.unitsKg") },
                        { value: "lb", label: t("settings.unitsLb") },
                      ]}
                      aria-label={t("settings.units")}
                    />
                  )}
                />
              </Field>
              <Field label={t("settings.clockFormat")}>
                <Controller
                  control={control}
                  name="clock"
                  render={({ field }) => (
                    <Segmented
                      value={field.value}
                      onValueChange={field.onChange}
                      options={[
                        { value: "24", label: t("settings.clock24") },
                        { value: "12", label: t("settings.clock12") },
                      ]}
                      aria-label={t("settings.clockFormat")}
                    />
                  )}
                />
              </Field>
            </FieldGrid>
            <Field label={t("settings.appLanguage")}>
              <Controller
                control={control}
                name="appLocale"
                render={({ field }) => (
                  <Segmented
                    value={field.value}
                    onValueChange={field.onChange}
                    options={[
                      { value: "en", label: t("lang.en") },
                      { value: "es", label: t("lang.es") },
                    ]}
                    aria-label={t("settings.appLanguage")}
                    className="max-w-xs"
                  />
                )}
              />
            </Field>
          </section>
        </div>
      </SettingsPanel>
    </form>
  );
};

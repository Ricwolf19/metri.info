"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { CheckIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { track } from "@/lib/analytics/track";
import { executeRecaptcha } from "@/lib/captcha/client";
import { sendContactMessage } from "@/lib/contact/send";
import {
  CONTACT_TOPICS,
  type ContactTopic,
  isContactTopic,
  MESSAGE_MAX,
} from "@/lib/contact/types";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { cn, focusOnMount } from "@/lib/utils";

type Fields = {
  name: string;
  email: string;
  message: string;
  topic: ContactTopic;
};
const FIELD_NAMES = ["name", "email", "message"] as const;

const TOPIC_KEY: Record<ContactTopic, TranslationKey> = {
  feedback: "contact.topicFeedback",
  bug: "contact.topicBug",
  premium: "contact.topicPremium",
  partnership: "contact.topicPartnership",
  other: "contact.topicOther",
};

const RECAPTCHA_PRIVACY = "https://policies.google.com/privacy";
const RECAPTCHA_TERMS = "https://policies.google.com/terms";

/** A field's error, tied to its input by `id` (`aria-describedby`). */
const FieldError = ({ id, message }: { id: string; message?: string }) =>
  message ? (
    <p id={id} className="animate-rise text-xs font-medium text-red-500">
      {message}
    </p>
  ) : null;

const describedBy = (...ids: (string | false | undefined)[]) =>
  ids.filter(Boolean).join(" ") || undefined;

/**
 * Contact form. `?topic=` preselects the subject (the plans section links
 * here with `premium`, the app with `bug`). The reCAPTCHA v3 script loads on
 * first submit through the shared loader, so the page itself never pays for it.
 */
export const ContactForm = () => {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const seeded = searchParams.get("topic");

  // The server validates (and localises) every rule, so the form has none of
  // its own: its field errors come back through `setError`.
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({
    defaultValues: {
      name: "",
      email: "",
      message: "",
      topic: isContactTopic(seeded) ? seeded : "feedback",
    },
  });
  const [topic, message] = useWatch({ control, name: ["topic", "message"] });
  const [sent, setSent] = useState(false);
  const formError = errors.root?.server?.message ?? null;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const token = await executeRecaptcha("contact").catch(() => null);
      const res = await sendContactMessage({ ...values, token, locale });
      if (res.ok) {
        setSent(true);
        // Keep the topic: "send another" is usually about the same thing.
        reset({ name: "", email: "", message: "", topic: values.topic });
        track("contact_sent", { topic: values.topic });
        toast({ title: t("contact.success"), variant: "success" });
        return;
      }
      for (const name of FIELD_NAMES) {
        const message = res.error.fieldErrors?.[name];
        if (message) setError(name, { message });
      }
      setError("root.server", { message: res.error.message });
    } catch {
      setError("root.server", { message: t("contact.errorGeneric") });
    }
  });

  if (sent) {
    return (
      <div
        role="status"
        className="animate-rise flex flex-col items-center rounded-card border border-brand/30 bg-brand/5 p-8 text-center"
      >
        <span className="animate-check-in flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-contrast">
          <CheckIcon size={28} />
        </span>
        {/* Focus moves here: the form (and the button pressed) is gone. */}
        <p
          ref={focusOnMount}
          tabIndex={-1}
          className="mt-5 text-lg font-semibold text-ink-50 focus:outline-none"
        >
          {t("contact.successTitle")}
        </p>
        <p className="mt-1.5 max-w-sm text-sm text-ink-300">
          {t("contact.success")}
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 text-sm font-medium text-accent hover:underline"
        >
          {t("contact.sendAnother")}
        </button>
      </div>
    );
  }

  const remaining = MESSAGE_MAX - message.length;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">{t("contact.nameLabel")}</Label>
          <Input
            id="contact-name"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy(
              Boolean(errors.name) && "contact-name-error",
            )}
            placeholder={t("contact.namePlaceholder")}
            {...register("name")}
          />
          <FieldError id="contact-name-error" message={errors.name?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-email">{t("contact.emailLabel")}</Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy(
              Boolean(errors.email) && "contact-email-error",
            )}
            placeholder={t("contact.emailPlaceholder")}
            {...register("email")}
          />
          <FieldError
            id="contact-email-error"
            message={errors.email?.message}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-topic">{t("contact.topicLabel")}</Label>
        <Controller
          control={control}
          name="topic"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => field.onChange(v as ContactTopic)}
            >
              <SelectTrigger
                id="contact-topic"
                aria-label={t("contact.topicLabel")}
                aria-describedby={describedBy(
                  topic === "premium" && "contact-premium-hint",
                )}
                onBlur={field.onBlur}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_TOPICS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(TOPIC_KEY[value])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {topic === "premium" && (
          <p
            id="contact-premium-hint"
            className="animate-rise text-xs leading-relaxed text-ink-400"
          >
            {t("contact.premiumHint")}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="contact-message">{t("contact.messageLabel")}</Label>
          {/* Read with the field (`aria-describedby`), not live: a live
              counter spoke on every keystroke. */}
          <span
            id="contact-count"
            className={cn(
              "font-mono text-[11px] tabular-nums",
              remaining < 0 ? "text-red-500" : "text-ink-500",
            )}
          >
            {message.length.toLocaleString()} / {MESSAGE_MAX.toLocaleString()}
          </span>
        </div>
        <Textarea
          id="contact-message"
          required
          rows={6}
          maxLength={MESSAGE_MAX + 100}
          aria-invalid={Boolean(errors.message) || remaining < 0}
          aria-describedby={describedBy(
            "contact-count",
            Boolean(errors.message) && "contact-message-error",
          )}
          placeholder={t("contact.messagePlaceholder")}
          {...register("message")}
        />
        <FieldError
          id="contact-message-error"
          message={errors.message?.message}
        />
      </div>

      {formError && (
        <p
          role="alert"
          className="animate-rise rounded-field border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400"
        >
          {formError}
        </p>
      )}

      <Button
        type="submit"
        disabled={remaining < 0}
        variant="brand"
        loading={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? t("contact.sending") : t("contact.submit")}
      </Button>

      <p className="text-xs leading-relaxed text-ink-400">
        {t("contact.recaptchaProtected")}{" "}
        <a
          href={RECAPTCHA_PRIVACY}
          target="_blank"
          rel="noreferrer noopener"
          className="underline hover:text-ink-300"
        >
          {t("contact.recaptchaPrivacy")}
        </a>{" "}
        {t("contact.recaptchaAnd")}{" "}
        <a
          href={RECAPTCHA_TERMS}
          target="_blank"
          rel="noreferrer noopener"
          className="underline hover:text-ink-300"
        >
          {t("contact.recaptchaTerms")}
        </a>{" "}
        {t("contact.recaptchaApply")}
      </p>
    </form>
  );
};

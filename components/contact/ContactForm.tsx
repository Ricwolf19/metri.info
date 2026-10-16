"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

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
import { cn } from "@/lib/utils";

type Fields = { name: string; email: string; message: string };
const EMPTY: Fields = { name: "", email: "", message: "" };

const TOPIC_KEY: Record<ContactTopic, TranslationKey> = {
  feedback: "contact.topicFeedback",
  bug: "contact.topicBug",
  premium: "contact.topicPremium",
  partnership: "contact.topicPartnership",
  other: "contact.topicOther",
};

const RECAPTCHA_PRIVACY = "https://policies.google.com/privacy";
const RECAPTCHA_TERMS = "https://policies.google.com/terms";

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="animate-rise text-xs font-medium text-red-500">{message}</p>
  ) : null;

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

  const [values, setValues] = useState<Fields>(EMPTY);
  const [topic, setTopic] = useState<ContactTopic>(
    isContactTopic(seeded) ? seeded : "feedback",
  );
  const [fieldErrors, setFieldErrors] = useState<Partial<Fields>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof Fields, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      const token = await executeRecaptcha("contact").catch(() => null);
      const res = await sendContactMessage({ ...values, topic, token, locale });
      if (res.ok) {
        setSent(true);
        setValues(EMPTY);
        track("contact_sent", { topic });
        toast({ title: t("contact.success"), variant: "success" });
        return;
      }
      if (res.error.fieldErrors) setFieldErrors(res.error.fieldErrors);
      setFormError(res.error.message);
    } catch {
      setFormError(t("contact.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div
        role="status"
        className="animate-rise flex flex-col items-center rounded-card border border-brand/30 bg-brand/5 p-8 text-center"
      >
        <span className="animate-check-in flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-contrast">
          <CheckIcon size={28} />
        </span>
        <p className="mt-5 text-lg font-semibold text-ink-50">
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

  const remaining = MESSAGE_MAX - values.message.length;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">{t("contact.nameLabel")}</Label>
          <Input
            id="contact-name"
            autoComplete="name"
            required
            value={values.name}
            aria-invalid={Boolean(fieldErrors.name)}
            placeholder={t("contact.namePlaceholder")}
            onChange={(e) => set("name", e.target.value)}
          />
          <FieldError message={fieldErrors.name} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact-email">{t("contact.emailLabel")}</Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            aria-invalid={Boolean(fieldErrors.email)}
            placeholder={t("contact.emailPlaceholder")}
            onChange={(e) => set("email", e.target.value)}
          />
          <FieldError message={fieldErrors.email} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-topic">{t("contact.topicLabel")}</Label>
        <Select
          value={topic}
          onValueChange={(v) => setTopic(v as ContactTopic)}
        >
          <SelectTrigger
            id="contact-topic"
            aria-label={t("contact.topicLabel")}
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
        {topic === "premium" && (
          <p className="animate-rise text-xs leading-relaxed text-ink-400">
            {t("contact.premiumHint")}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="contact-message">{t("contact.messageLabel")}</Label>
          <span
            className={cn(
              "font-mono text-[11px] tabular-nums",
              remaining < 0 ? "text-red-500" : "text-ink-500",
            )}
            aria-live="polite"
          >
            {values.message.length.toLocaleString()} /{" "}
            {MESSAGE_MAX.toLocaleString()}
          </span>
        </div>
        <Textarea
          id="contact-message"
          required
          rows={6}
          maxLength={MESSAGE_MAX + 100}
          value={values.message}
          aria-invalid={Boolean(fieldErrors.message)}
          placeholder={t("contact.messagePlaceholder")}
          onChange={(e) => set("message", e.target.value)}
        />
        <FieldError message={fieldErrors.message} />
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
        loading={loading}
        className="w-full"
      >
        {loading ? t("contact.sending") : t("contact.submit")}
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

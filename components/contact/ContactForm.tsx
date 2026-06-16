"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage } from "@/lib/contact/send";
import { useI18n } from "@/lib/i18n";

import { useRecaptcha } from "./useRecaptcha";

type Fields = { name: string; email: string; message: string };
const EMPTY: Fields = { name: "", email: "", message: "" };

const RECAPTCHA_PRIVACY = "https://policies.google.com/privacy";
const RECAPTCHA_TERMS = "https://policies.google.com/terms";

export const ContactForm = () => {
  const { t, locale } = useI18n();
  const { execute } = useRecaptcha();

  const [values, setValues] = useState<Fields>(EMPTY);
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
      const token = await execute("contact");
      const res = await sendContactMessage({ ...values, token, locale });
      if (res.ok) {
        setSent(true);
        setValues(EMPTY);
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
        className="rounded-card border border-ink-600 bg-ink-800 p-6 text-center"
      >
        <p className="font-medium text-ink-50">{t("contact.success")}</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-3 text-sm font-medium text-accent hover:underline"
        >
          {t("contact.sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
        {fieldErrors.name && (
          <p className="text-xs font-medium text-red-500">{fieldErrors.name}</p>
        )}
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
        {fieldErrors.email && (
          <p className="text-xs font-medium text-red-500">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message">{t("contact.messageLabel")}</Label>
        <Textarea
          id="contact-message"
          required
          rows={6}
          value={values.message}
          aria-invalid={Boolean(fieldErrors.message)}
          placeholder={t("contact.messagePlaceholder")}
          onChange={(e) => set("message", e.target.value)}
        />
        {fieldErrors.message && (
          <p className="text-xs font-medium text-red-500">
            {fieldErrors.message}
          </p>
        )}
      </div>

      {formError && (
        <p role="alert" className="text-sm font-medium text-red-500">
          {formError}
        </p>
      )}

      <Button type="submit" loading={loading} className="w-full">
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

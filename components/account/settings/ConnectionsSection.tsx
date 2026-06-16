"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { GithubIcon, LockIcon } from "@/components/icons";
import {
  PanelStatus,
  SettingsPanel,
} from "@/components/account/settings/SettingsPanel";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { type SocialProvider, SOCIAL_PROVIDERS } from "@/lib/account/providers";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n/en";
import { routePath } from "@/lib/i18n/routes";

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
    />
  </svg>
);

const PROVIDER_META: Record<
  SocialProvider,
  { labelKey: TranslationKey; icon: React.ReactNode }
> = {
  google: { labelKey: "settings.providerGoogle", icon: <GoogleMark /> },
  github: {
    labelKey: "settings.providerGithub",
    icon: <GithubIcon size={18} />,
  },
};

/**
 * Manage sign-in connections. Lists the credential (email/password) row plus the
 * social providers, with link/unlink controls.
 *
 * Lock-out guard: a user must always keep at least one way to sign in. We block
 * unlinking the last remaining login method client-side (Better Auth also
 * rejects unlinking the very last account server-side); when the user is
 * OAuth-only we additionally nudge them to set a password first.
 */
export const ConnectionsSection = ({
  id,
  providerIds: initialProviderIds,
  hasPassword,
}: {
  id: string;
  providerIds: string[];
  hasPassword: boolean;
}) => {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [providerIds, setProviderIds] = useState(initialProviderIds);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const loginMethodCount = new Set(providerIds).size;
  const settingsPath = routePath("accountSettings", locale);

  const link = async (provider: SocialProvider) => {
    setStatus(null);
    setBusy(provider);
    try {
      await authClient.linkSocial({ provider, callbackURL: settingsPath });
    } catch {
      setBusy(null);
      setStatus({ tone: "error", message: t("settings.connectError") });
    }
  };

  const unlink = async (providerId: string) => {
    setStatus(null);
    setBusy(providerId);
    try {
      const res = await authClient.unlinkAccount({ providerId });
      if (res.error) {
        setStatus({ tone: "error", message: t("settings.connectError") });
        return;
      }
      setProviderIds((ids) => ids.filter((p) => p !== providerId));
      setStatus({ tone: "success", message: t("settings.disconnected") });
      router.refresh();
    } catch {
      setStatus({ tone: "error", message: t("settings.connectError") });
    } finally {
      setBusy(null);
    }
  };

  const isCredentialConnected = providerIds.includes("credential");

  return (
    <SettingsPanel
      id={id}
      title={t("settings.connectionsTitle")}
      description={t("settings.connectionsDesc")}
      footer={
        <PanelStatus
          message={status?.message ?? null}
          tone={status?.tone ?? "success"}
        />
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-ink-600 bg-ink-900/40 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-700 text-ink-100">
              <LockIcon size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-50">
                {t("settings.providerCredential")}
              </p>
              <p className="text-xs text-ink-400">
                {isCredentialConnected
                  ? t("settings.connected")
                  : t("settings.notConnected")}
              </p>
            </div>
          </div>
        </div>

        {SOCIAL_PROVIDERS.map((provider) => {
          const connected = providerIds.includes(provider);
          const isLastMethod = connected && loginMethodCount <= 1;
          const meta = PROVIDER_META[provider];
          return (
            <div
              key={provider}
              className="flex items-center justify-between gap-4 rounded-xl border border-ink-600 bg-ink-900/40 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-700">
                  {meta.icon}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-50">
                    {t(meta.labelKey)}
                  </p>
                  <p className="text-xs text-ink-400">
                    {connected
                      ? t("settings.connected")
                      : t("settings.notConnected")}
                  </p>
                </div>
              </div>
              {connected ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy !== null || isLastMethod}
                  loading={busy === provider}
                  onClick={() => unlink(provider)}
                  title={
                    isLastMethod ? t("settings.lastMethodNotice") : undefined
                  }
                >
                  {t("settings.disconnect")}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={busy !== null}
                  loading={busy === provider}
                  onClick={() => link(provider)}
                >
                  {t("settings.connect")}
                </Button>
              )}
            </div>
          );
        })}

        {!hasPassword && (
          <p className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-xs text-ink-200">
            {t("settings.connectionsNoPasswordNotice")}
          </p>
        )}
      </div>
    </SettingsPanel>
  );
};

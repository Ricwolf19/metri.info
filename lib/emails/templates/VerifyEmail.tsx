import { Link, Text } from "@react-email/components";

import {
  CtaButton,
  EmailHeading,
  EmailLink,
  EmailParagraph,
  EmailShell,
  emailTheme,
} from "./BaseLayout";

type VerifyEmailProps = {
  /** Display name to greet the user by (may be missing for social signups). */
  name?: string | null;
  /** Confirmation URL produced by Better Auth (token-signed). */
  url: string;
  /** How long the link is valid, for the human-readable copy. */
  expiresIn?: string;
};

/** Email confirming a freshly-created Metri account. */
export const VerifyEmail = ({
  name,
  url,
  expiresIn = "1 hour",
}: VerifyEmailProps) => {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return (
    <EmailShell preview="Confirm your Metri email">
      <EmailHeading>Confirm your email</EmailHeading>
      <EmailParagraph>{greeting}</EmailParagraph>
      <EmailParagraph>
        Thanks for creating a Metri account. Tap the button below to confirm
        this email address and finish setting up your account.
      </EmailParagraph>
      <CtaButton href={url} label="Confirm email" />
      <EmailParagraph muted>
        Or copy this link into your browser:
        <br />
        <EmailLink href={url}>{url}</EmailLink>
      </EmailParagraph>
      <EmailParagraph muted>
        This link expires in {expiresIn}. If it does, request a new one from the
        sign-in page.
      </EmailParagraph>
      <Text
        style={{
          fontSize: 13,
          color: emailTheme.textSubtle,
          marginTop: 8,
        }}
      >
        Didn&apos;t sign up for Metri? You can safely ignore this email — no
        account will be created.
      </Text>
      <Link
        href="https://metri.info"
        style={{
          fontSize: 12,
          color: emailTheme.textSubtle,
          textDecoration: "underline",
        }}
      >
        metri.info
      </Link>
    </EmailShell>
  );
};

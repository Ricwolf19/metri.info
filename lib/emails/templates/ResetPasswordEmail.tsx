import { Text } from "@react-email/components";

import {
  CtaButton,
  EmailHeading,
  EmailLink,
  EmailParagraph,
  EmailShell,
  emailTheme,
} from "./BaseLayout";

type ResetPasswordEmailProps = {
  /** Display name from the user row (may be missing). */
  name?: string | null;
  /** Password-reset URL produced by Better Auth. */
  url: string;
  /** How long the link is valid, for the human-readable copy. */
  expiresIn?: string;
};

/** Email delivering the password-reset link. */
export const ResetPasswordEmail = ({
  name,
  url,
  expiresIn = "1 hour",
}: ResetPasswordEmailProps) => {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return (
    <EmailShell preview="Reset your Metri password">
      <EmailHeading>Reset your password</EmailHeading>
      <EmailParagraph>{greeting}</EmailParagraph>
      <EmailParagraph>
        We received a request to reset the password for your Metri account. Tap
        the button below to choose a new one.
      </EmailParagraph>
      <CtaButton href={url} label="Choose a new password" />
      <EmailParagraph muted>
        Or copy this link into your browser:
        <br />
        <EmailLink href={url}>{url}</EmailLink>
      </EmailParagraph>
      <EmailParagraph muted>This link expires in {expiresIn}.</EmailParagraph>
      <Text
        style={{
          fontSize: 13,
          color: emailTheme.textSubtle,
          marginTop: 8,
        }}
      >
        Didn&apos;t request a password reset? You can safely ignore this email —
        your password will stay the same.
      </Text>
    </EmailShell>
  );
};

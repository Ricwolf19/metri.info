import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { absoluteUrl } from "@/lib/utils";

/**
 * Email design tokens — mirror Metri's dark-first palette so a "verify your
 * email" message and a marketing page look like the same product.
 */
export const emailTheme = {
  bg: "#0E0E10",
  card: "#15151A",
  cardBorder: "#26262B",
  text: "#F4F4F5",
  textMuted: "#A1A1AA",
  textSubtle: "#71717A",
  accent: "#A3E635",
  accentText: "#08090D",
  warn: "#FF6B35",
  link: "#D4D4D8",
  footerBg: "transparent",
  maxWidth: 560,
} as const;

export const MONO_FONT = "ui-monospace, Menlo, Consolas, monospace";

/** Brand mark as a hosted PNG: inline SVG doesn't survive Gmail, and an image
 * also keeps the lime fill no email client can recolour. */
const MetriLogoEmail = ({ size = 40 }: { size?: number }) => (
  <Img
    src={absoluteUrl("/brand/icon-192.png")}
    width={size}
    height={size}
    alt="Metri"
    style={{ display: "block", margin: "0 auto", borderRadius: 10 }}
  />
);

const DEFAULT_FOOTER_NOTE =
  "You received this email because someone (hopefully you) used this address on metri.info. If it wasn't you, you can safely ignore it.";

const Footer = ({
  tagline,
  note,
}: {
  tagline: string;
  note: React.ReactNode;
}) => (
  <Section style={{ marginTop: 32 }}>
    <Hr
      style={{
        border: "none",
        borderTop: `1px solid ${emailTheme.cardBorder}`,
        margin: "24px 0",
      }}
    />
    <Text
      style={{
        fontSize: 12,
        color: emailTheme.textSubtle,
        textAlign: "center",
        margin: 0,
      }}
    >
      {tagline}
    </Text>
    <Text
      style={{
        fontSize: 12,
        color: emailTheme.textSubtle,
        textAlign: "center",
        margin: "8px 0 0",
      }}
    >
      {note}
    </Text>
  </Section>
);

/** Shared shell for transactional emails — logo, card, footer. The footer
 * defaults to the auth-mail copy; announcements pass their own opt-out note. */
export const EmailShell = ({
  preview,
  children,
  lang = "en",
  tagline = "Metri · open-source fitness, built for lifters.",
  footerNote = DEFAULT_FOOTER_NOTE,
}: {
  preview: string;
  children: React.ReactNode;
  lang?: string;
  tagline?: string;
  footerNote?: React.ReactNode;
}) => (
  <Html lang={lang}>
    <Head />
    <Preview>{preview}</Preview>
    <Body
      style={{
        backgroundColor: emailTheme.bg,
        margin: 0,
        padding: 0,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: emailTheme.text,
      }}
    >
      <Container
        style={{
          maxWidth: emailTheme.maxWidth,
          margin: "0 auto",
          padding: "28px 16px",
        }}
      >
        <Section style={{ textAlign: "center", marginBottom: 24 }}>
          <MetriLogoEmail />
        </Section>
        <Section
          style={{
            backgroundColor: emailTheme.card,
            border: `1px solid ${emailTheme.cardBorder}`,
            borderRadius: 14,
            padding: "28px 20px",
          }}
        >
          {children}
        </Section>
        <Footer tagline={tagline} note={footerNote} />
      </Container>
    </Body>
  </Html>
);

export const EmailHeading = ({ children }: { children: React.ReactNode }) => (
  <Text
    style={{
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: "-0.01em",
      margin: "0 0 12px",
      color: emailTheme.text,
    }}
  >
    {children}
  </Text>
);

export const EmailParagraph = ({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) => (
  <Text
    style={{
      fontSize: 15,
      lineHeight: 1.6,
      color: muted ? emailTheme.textMuted : emailTheme.text,
      margin: "0 0 16px",
    }}
  >
    {children}
  </Text>
);

export const EmailLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    style={{ color: emailTheme.link, textDecoration: "underline" }}
  >
    {children}
  </a>
);

/** A small mono label above a heading, on its own line. */
export const EmailKicker = ({ children }: { children: React.ReactNode }) => (
  <Text
    style={{
      color: emailTheme.accent,
      fontFamily: MONO_FONT,
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      margin: "0 0 8px",
    }}
  >
    {children}
  </Text>
);

export const EmailDivider = () => (
  <Hr
    style={{
      border: "none",
      borderTop: `1px solid ${emailTheme.cardBorder}`,
      margin: "16px 0 20px",
    }}
  />
);

/** A section label inside a card. */
export const EmailSectionLabel = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <Text
    style={{
      fontSize: 11,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: emailTheme.textSubtle,
      fontFamily: MONO_FONT,
      margin: "20px 0 8px",
    }}
  >
    {children}
  </Text>
);

/** `block` fills the card, which is what a thumb wants on a phone. */
export const CtaButton = ({
  href,
  label,
  block = false,
}: {
  href: string;
  label: string;
  block?: boolean;
}) => (
  <Section style={{ textAlign: "center", margin: "24px 0 8px" }}>
    <a
      href={href}
      style={{
        display: block ? "block" : "inline-block",
        backgroundColor: emailTheme.accent,
        color: emailTheme.accentText,
        padding: "14px 28px",
        borderRadius: 10,
        fontWeight: 600,
        fontSize: 15,
        textAlign: "center",
        textDecoration: "none",
      }}
    >
      {label}
    </a>
  </Section>
);

import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

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
  link: "#D4D4D8",
  footerBg: "transparent",
  maxWidth: 560,
} as const;

/** Brand mark — reuses the same path as `MetriMark` so the email matches the
 * app logo exactly. The fill is hardcoded to lime because `currentColor` is
 * unreliable across email clients (Gmail in particular) and the mark ended up
 * grey/dark on first render — the wrap-inherits-color trick doesn't survive a
 * max-1-level CSS cascade. */
export const MetriLogoEmail = ({ size = 40 }: { size?: number }) => (
  <svg
    viewBox="0 0 1024 1024"
    width={size}
    height={size}
    fill={emailTheme.accent}
    style={{ display: "block" }}
    aria-hidden="true"
  >
    <g transform="translate(512 512) scale(4.2) translate(-512 -423)">
      <path d="M508.807 356.242c9.551-.178 22.716-1.285 23.606 12.61.504 7.861.157 16.342.23 24.277q.283 25.577.301 51.156.015 17.17-.222 34.337c-.146 15.519 3.533 29.756-16.398 30.562-12.602.171-23.216 1.473-23.828-14.818-.343-9.154-.325-18.281-.361-27.442l-.024-49.852.153-33.037c.103-14.814-2.786-27.249 16.543-27.793" />
      <path d="M553.526 377.152c13.331-.408 25.535-1.966 25.437 15.588-.161 28.516.308 57.081-.154 85.587-.126 7.812-4.002 11.092-11.387 12.766-28.534 3.032-26.249-5.46-26.325-29.004l-.031-29.167.062-27.922c.049-12.308-2.966-25.451 12.398-27.848" />
      <path d="M457.78 377.196c7.531-.264 18.699-1.008 23.806 5.58.891 1.15 1.688 6.653 1.697 8.415.144 29.097.3 58.236-.064 87.329-.092 7.34-3.568 10.834-10.593 12.502-4.044.229-7.952.527-12.004.391-16.806-.562-14.697-11.277-14.689-23.425l.038-27.08-.037-33.995c-.004-3.799.047-7.821-.004-11.602-.133-9.982.344-16.472 11.85-18.115" />
      <path d="m433.367 401.227 6.363.171-.208 65.049c-3.475.081-7.075.007-10.56-.021-2.299-.626-6.319-3.016-6.453-5.504-.904-16.769-.482-34.121-.361-50.915.057-7.841 4.684-8.3 11.219-8.78" />
      <path d="M585.526 401.42c7.984-.203 11.976-1.644 16.964 5.452.131 2.993.157 6.107.099 9.134-.284 14.83.646 29.881-.421 44.648-.082 1.141-1.453 2.795-2.188 3.698-4.371 2.821-9.614 2.084-14.734 1.912z" />
      <path d="M410.397 425.075c2.651-.172 5.923-.128 8.635-.156l.056 16.694c-1.897-.014-4.193.251-6.111.417-3.73-.536-6.282-1.568-7.92-5.262a8.47 8.47 0 0 1-.123-6.517c1.158-2.902 2.782-3.923 5.463-5.176" />
      <path d="M605.893 425.019c4.123-.166 7.07-.683 10.77 1.629 5.036 3.147 4.176 8.615 1.224 13.032-3.574 2.987-7.423 2.259-11.97 2.054a597 597 0 0 1-.024-16.715" />
    </g>
  </svg>
);

const Footer = () => (
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
      Metri — open-source fitness, built for lifters.
    </Text>
    <Text
      style={{
        fontSize: 12,
        color: emailTheme.textSubtle,
        textAlign: "center",
        margin: "8px 0 0",
      }}
    >
      You received this email because someone (hopefully you) used this address
      on metri.info. If it wasn&apos;t you, you can safely ignore it.
    </Text>
  </Section>
);

/** Shared shell for transactional emails — logo, card, footer. */
export const EmailShell = ({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) => (
  <Html lang="en">
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
          padding: "32px 24px",
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
            padding: "32px 28px",
          }}
        >
          {children}
        </Section>
        <Footer />
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

export const CtaButton = ({ href, label }: { href: string; label: string }) => (
  <Section style={{ textAlign: "center", margin: "24px 0 8px" }}>
    <a
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: emailTheme.accent,
        color: emailTheme.accentText,
        padding: "14px 28px",
        borderRadius: 10,
        fontWeight: 600,
        fontSize: 15,
        textDecoration: "none",
      }}
    >
      {label}
    </a>
  </Section>
);

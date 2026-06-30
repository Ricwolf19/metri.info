import { render } from "@react-email/components";
import { createElement } from "react";

import { ResetPasswordEmail } from "./templates/ResetPasswordEmail";
import { VerifyEmail } from "./templates/VerifyEmail";

type Rendered = { html: string; text: string };

/** Render a transactional email into HTML + plain-text fallback. Plain-text is required because some clients (and our debug previews) prefer it, and Resend accepts both. */
const renderEmail = async (template: React.ReactElement): Promise<Rendered> => {
  const [html, text] = await Promise.all([
    render(template),
    render(template, { plainText: true }),
  ]);
  return { html, text };
};

export const renderVerifyEmail = (props: {
  name?: string | null;
  url: string;
  expiresIn?: string;
}): Promise<Rendered> => renderEmail(createElement(VerifyEmail, props));

export const renderResetPasswordEmail = (props: {
  name?: string | null;
  url: string;
  expiresIn?: string;
}): Promise<Rendered> => renderEmail(createElement(ResetPasswordEmail, props));

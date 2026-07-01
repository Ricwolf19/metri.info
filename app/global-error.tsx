"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

/**
 * App Router global error boundary — canonical place to wire
 * `Sentry.captureException` from a Client Component per Sentry's Next.js guide.
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */
const GlobalError = ({ error }: { error: Error & { digest?: string } }) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html lang="en">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
};

export default GlobalError;

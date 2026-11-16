/** A form's own error under its fields (the server's answer, not a field
 * rule), announced when it appears. Renders nothing without a message. */
export const FormError = ({ message }: { message?: string | null }) =>
  message ? (
    <p role="alert" className="text-sm font-medium text-red-500">
      {message}
    </p>
  ) : null;

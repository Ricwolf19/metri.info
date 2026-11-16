/** A diagnostic field's rule message, announced when it appears. */
export const QuestionError = ({ message }: { message?: string }) =>
  message ? (
    <p role="alert" className="mt-3 text-sm font-medium text-red-400">
      {message}
    </p>
  ) : null;

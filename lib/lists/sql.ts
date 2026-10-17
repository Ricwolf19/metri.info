import "server-only";

/** `SELECT` fragment: a `timestamp` column as an ISO-8601 UTC string, so rows
 * cross the RSC boundary and the action wire as plain strings. `column` must
 * be a trusted literal (never user input): it is interpolated into SQL. */
export const isoColumn = (column: string, alias: string) =>
  `to_char(${column} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "${alias}"`;

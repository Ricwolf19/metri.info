/** `publishedAt` is an ISO string so it survives `use cache` serialization. */
export type AppRelease = {
  version: string;
  tag: string;
  runtimeVersion: string;
  /** Versioned asset URL — stable per release, never replaced in place. */
  apkUrl: string;
  sha256: string;
  sizeBytes: number;
  /** release-please changelog, markdown. */
  notes: string;
  publishedAt: string;
  releaseUrl: string;
};

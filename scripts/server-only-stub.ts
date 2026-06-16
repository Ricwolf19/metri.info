/**
 * Preload for Bun CLI scripts (`db:seed`, `admin:bootstrap`). Those import
 * server-guarded modules (`lib/db`, `lib/auth/server`) which start with
 * `import "server-only"`. That guard is meant for the Next bundle; on the CLI
 * there's no RSC resolver, so `server-only` resolves to its throwing entry and
 * kills the script. Stubbing it to an empty module makes the imports safe here.
 *
 * Uses the `Bun` global (locally typed) so it needs no `bun` type package in the
 * app tsconfig. Only ever loaded via `bun --preload`, never bundled.
 */
declare const Bun: {
  plugin: (p: {
    name: string;
    setup: (build: {
      module: (
        specifier: string,
        load: () => { exports: Record<string, unknown>; loader: "object" },
      ) => void;
    }) => void;
  }) => void;
};

Bun.plugin({
  name: "server-only-stub",
  setup(build) {
    build.module("server-only", () => ({ exports: {}, loader: "object" }));
  },
});

export {};

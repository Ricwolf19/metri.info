import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Modules under test start with `import "server-only"`, whose real entry
    // throws outside an RSC resolver — same reason scripts/server-only-stub.ts
    // exists for Bun CLIs. Vitest swaps it for an empty module instead.
    alias: {
      "server-only": new URL("./scripts/server-only.empty.ts", import.meta.url)
        .pathname,
      "@": new URL(".", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
});

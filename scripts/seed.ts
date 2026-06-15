/**
 * Seed the catalog mirror (exercises + programs) into Postgres from the bundled
 * static data. Run with a real DATABASE_URL: `bun run db:seed`.
 * The public website renders from the static data directly; this populates the
 * DB for the API layer and future mobile sync.
 */
import { db } from "@/lib/db";
import { exercise, program } from "@/lib/db/schema";
import { EXERCISES } from "@/lib/exercises/data";
import { PROGRAMS } from "@/lib/programs/data";

if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL is not set. Configure it before seeding.");
  process.exit(1);
}

const run = async () => {
  for (const e of EXERCISES) {
    await db
      .insert(exercise)
      .values({
        id: e.slug,
        name: e.name.en,
        category: e.category,
        primaryMuscles: e.primaryMuscles,
        secondaryMuscles: e.secondaryMuscles,
        equipment: e.equipment,
        difficulty: e.difficulty,
        instructions: e.instructions.en,
      })
      .onConflictDoNothing();
  }

  for (const p of PROGRAMS) {
    await db
      .insert(program)
      .values({
        id: p.slug,
        name: p.name.en,
        description: p.description.en,
        durationWeeks: p.durationWeeks,
        daysPerWeek: p.daysPerWeek,
        difficulty: p.difficulty,
        goal: p.goal,
        isFeatured: Boolean(p.featured),
      })
      .onConflictDoNothing();
  }

  console.log(
    `✓ Seeded ${EXERCISES.length} exercises and ${PROGRAMS.length} programs.`,
  );
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

"use server";

import { getSession } from "@/lib/auth/session";
import type { CalcFacts } from "@/lib/calculators/prefill";
import { readCalcFacts } from "@/lib/calculators/read-facts";

/**
 * Client-callable: what we know about the signed-in user, to seed calculator
 * inputs. Null for guests. Fetched client-side on purpose: the calculator
 * pages are statically generated, and reading per-user data on the server
 * would make them dynamic.
 */
export const getCalcFacts = async (): Promise<CalcFacts | null> => {
  const session = await getSession();
  return session ? readCalcFacts(session.user.id) : null;
};

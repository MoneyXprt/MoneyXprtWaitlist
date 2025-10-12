"use server";

import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db/index";
import {
  profiles,
  household as householdTable,
  plan,
  planItem,
  calcSnapshot,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { mapToScoreInput } from "./map";
import { calculateKeepMoreScore } from "./index";

export async function recalculateKeepMoreScore(): Promise<{
  score: number;
  breakdown: ReturnType<typeof calculateKeepMoreScore>["breakdown"];
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized: no user");
  }

  const db = getDb();

  // Fetch profile (optional) and household (optional)
  const [profileRow] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  const [householdRow] = await db
    .select()
    .from(householdTable)
    .where(eq(householdTable.ownerId, user.id))
    .limit(1);

  // Fetch latest plan and its items (optional)
  const [latestPlan] = await db
    .select()
    .from(plan)
    .where(eq(plan.userId, user.id))
    .orderBy(desc(plan.createdAt))
    .limit(1);

  let items: Array<Record<string, any>> = [];
  if (latestPlan) {
    items = await db.select().from(planItem).where(eq(planItem.recoId, latestPlan.id));
  }

  const scoreInput = mapToScoreInput({ profile: profileRow, household: householdRow, planItems: items });
  const result = calculateKeepMoreScore(scoreInput);

  const payload = {
    year: new Date().getFullYear(),
    score: result.score,
    breakdown: result.breakdown,
    tax_liability: null as number | null,
  };

  await db.insert(calcSnapshot).values({
    userId: user.id,
    kind: "keep_more_score",
    payload,
  });

  return { score: result.score, breakdown: result.breakdown };
}


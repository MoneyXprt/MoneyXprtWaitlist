// app/api/plan/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const input = await req.json(); // PlannerInput
  const recs: string[] = [];

  // Simple, deterministic suggestions (replace with AI later if you want)
  if (input.w2Income > 200_000) {
    recs.push("Max out 401(k) employee deferrals; consider mega backdoor Roth if plan allows.");
  }
  if (input.hdhpEligible) {
    recs.push("Open and fully fund an HSA; invest the HSA for long-term growth.");
  }
  if ((input.capitalGains ?? 0) + (input.ordinaryDividends ?? 0) + (input.qualifiedDividends ?? 0) > 0) {
    recs.push("Harvest losses to offset gains; locate taxable bonds in tax-advantaged accounts.");
  }
  if ((input.rentalUnits ?? 0) > 0) {
    recs.push("Track real estate professional hours / material participation; consider cost segregation.");
  }
  if ((input.mortgageInterest ?? 0) + (input.propertyTax ?? 0) + (input.charitableCash ?? 0) > 12_000) {
    recs.push("Run standard vs. itemized deduction comparison; bunch charitable giving via donor-advised fund.");
  }
  if ((input.contrib529 ?? 0) > 0) {
    recs.push("Confirm state tax benefits for 529 contributions; automate monthly 529 funding.");
  }
  if ((input.rsuVestedValue ?? 0) > 0) {
    recs.push("Plan RSU tax withholding gaps; consider 83(b)/10b5-1 strategy where applicable.");
  }

  // Always return at least one
  if (recs.length === 0) recs.push("No obvious opportunities detected—tune inputs for more detailed suggestions.");

  return NextResponse.json({ recommendations: recs });
}
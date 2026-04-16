import { NextResponse } from "next/server";
import { applyScenario, resetStore } from "@/lib/store";

export const dynamic = "force-dynamic";

const KNOWN_SCENARIOS = ["empty-list", "all-archived"];

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ scenario: string }> },
) {
  const { scenario } = await params;
  resetStore();
  const result = applyScenario(scenario);
  if (!result.applied) {
    return NextResponse.json(
      {
        error: `Unknown scenario: ${scenario}`,
        knownScenarios: KNOWN_SCENARIOS,
      },
      { status: 400 },
    );
  }
  return NextResponse.json({ scenario, applied: true });
}

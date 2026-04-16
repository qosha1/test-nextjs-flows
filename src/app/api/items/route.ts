import { NextResponse } from "next/server";
import { getListItems } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const empty = url.searchParams.get("empty") === "1";
  const fail = url.searchParams.get("fail") === "1";

  if (fail) {
    return NextResponse.json(
      { error: "Simulated failure" },
      { status: 500 },
    );
  }

  const items = await getListItems({ empty });
  return NextResponse.json({ items });
}

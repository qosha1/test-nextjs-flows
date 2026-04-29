import { NextResponse } from "next/server";
import { getListItems } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const empty = url.searchParams.get("empty") === "1";
  const fail = url.searchParams.get("fail") === "1";
  const page = parseInt(url.searchParams.get("page") ?? "0", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "0", 10);

  if (fail) {
    return NextResponse.json(
      { error: "Simulated failure" },
      { status: 500 },
    );
  }

  const all = await getListItems({ empty });

  if (page > 0 && pageSize > 0) {
    const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
    const clamped = Math.min(Math.max(page, 1), totalPages);
    const items = all.slice((clamped - 1) * pageSize, clamped * pageSize);
    return NextResponse.json({ items, page: clamped, pageSize, totalPages, total: all.length });
  }

  return NextResponse.json({ items: all });
}

import { NextResponse } from "next/server";
import { toggleLike } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const result = await toggleLike(id);
  if (!result.item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!result.ok) {
    return NextResponse.json(
      { error: "Simulated like failure", item: result.item },
      { status: 500 },
    );
  }
  return NextResponse.json({ item: result.item });
}

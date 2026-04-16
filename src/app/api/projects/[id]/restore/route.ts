import { NextResponse } from "next/server";
import { restoreProject } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    project?: { id: number; name: string };
    index?: number;
  };
  if (!body.project || typeof body.index !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  restoreProject(body.project, body.index);
  return NextResponse.json({ restored: body.project });
}

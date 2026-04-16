import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { resetStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST() {
  resetStore();
  const jar = await cookies();
  for (const cookie of jar.getAll()) {
    jar.delete(cookie.name);
  }
  return NextResponse.json({ reset: true });
}

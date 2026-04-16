import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const DEMO_EMAIL = "demo@test.com";
const DEMO_PASSWORD = "password123";

export async function getSession(): Promise<{ email: string } | null> {
  const jar = await cookies();
  const value = jar.get(COOKIE_NAME)?.value;
  if (!value) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf-8"),
    ) as { email?: unknown };
    if (typeof parsed.email === "string") {
      return { email: parsed.email };
    }
    return null;
  } catch {
    return null;
  }
}

export async function createSession(email: string): Promise<void> {
  const jar = await cookies();
  const value = Buffer.from(JSON.stringify({ email }), "utf-8").toString(
    "base64url",
  );
  jar.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export function checkCredentials(email: string, password: string): boolean {
  return email === DEMO_EMAIL && password === DEMO_PASSWORD;
}

export const DEMO_CREDENTIALS = {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
};

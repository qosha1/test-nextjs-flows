"use server";

import { redirect } from "next/navigation";
import { checkCredentials, clearSession, createSession } from "@/lib/session";

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/flows/auth?error=missing");
  }
  if (!checkCredentials(email, password)) {
    redirect("/flows/auth?error=invalid");
  }
  await createSession(email);
  redirect("/flows/auth/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/flows/auth");
}

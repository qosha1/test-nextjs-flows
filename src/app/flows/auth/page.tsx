import { redirect } from "next/navigation";
import { getSession, DEMO_CREDENTIALS } from "@/lib/session";
import { loginAction } from "./actions";

export default async function AuthLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/flows/auth/dashboard");

  const { error } = await searchParams;
  const errorMessage =
    error === "invalid"
      ? "Invalid email or password"
      : error === "missing"
        ? "Email and password are required"
        : null;

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Demo credentials: <code className="font-mono">{DEMO_CREDENTIALS.email}</code>{" "}
        / <code className="font-mono">{DEMO_CREDENTIALS.password}</code>
      </p>
      <form action={loginAction} className="mt-6 space-y-4" data-testid="login-form">
        <div>
          <label className="block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
            data-testid="email-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
            data-testid="password-input"
          />
        </div>
        {errorMessage ? (
          <p
            role="alert"
            data-testid="login-error"
            className="text-sm text-red-500"
          >
            {errorMessage}
          </p>
        ) : null}
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
          data-testid="login-submit"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}

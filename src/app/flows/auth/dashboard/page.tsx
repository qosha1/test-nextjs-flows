import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logoutAction } from "../actions";

export default async function AuthDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/flows/auth");

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-semibold" data-testid="dashboard-heading">
        Welcome, {session.email}
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        You are signed in. Your session is stored in an HTTP-only cookie.
      </p>
      <form action={logoutAction} className="mt-6">
        <button
          type="submit"
          className="rounded-md border px-4 py-2 text-sm font-medium"
          data-testid="logout-submit"
        >
          Logout
        </button>
      </form>
    </main>
  );
}

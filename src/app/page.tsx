import Link from "next/link";

type Flow = {
  href: string;
  title: string;
  description: string;
  stresses: string;
};

const flows: Flow[] = [
  {
    href: "/flows/auth",
    title: "Auth session",
    description: "Cookie-based login with protected dashboard.",
    stresses: "Session persistence, redirect handling, protected routes.",
  },
  {
    href: "/flows/wizard",
    title: "Multi-step wizard",
    description: "Three-step form with per-step validation and back/forward navigation.",
    stresses: "Multi-page state, URL-driven state, back-button semantics.",
  },
  {
    href: "/flows/async-list",
    title: "Async list with retry",
    description: "Loading / success / error / empty states with manual retry.",
    stresses: "Timing-sensitive transitions, error vs empty discrimination.",
  },
  {
    href: "/flows/optimistic",
    title: "Optimistic UI",
    description: "Like/unlike with deterministic rollback on simulated failure.",
    stresses: "State inversion under latency, successful action vs rollback.",
  },
  {
    href: "/flows/search",
    title: "Debounced search",
    description: "300ms debounced input with AbortController cancellation.",
    stresses: "Debounce window, request cancellation, network request count.",
  },
  {
    href: "/flows/modals",
    title: "Modal stack",
    description: "Nested delete-confirm with 5s Undo window.",
    stresses: "Modal stacking, focus trap, time-bounded actions.",
  },
  {
    href: "/flows/items",
    title: "Dynamic route with params",
    description: "Edit page at /flows/items/[id]/edit with dirty-state navigation guard.",
    stresses: "URL param extraction, dirty-state detection.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">test-nextjs-flows</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Non-trivial UI flows for evaluating the DebuggAI E2E workflow against
          ground truth.
        </p>
      </header>
      <ul className="space-y-3">
        {flows.map((flow) => (
          <li key={flow.href}>
            <Link
              href={flow.href}
              className="hover:border-foreground/40 hover:bg-accent block rounded-md border p-4 transition"
              data-testid={`flow-link-${flow.href.split("/").pop()}`}
            >
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-medium">{flow.title}</h2>
                <span className="text-muted-foreground font-mono text-xs">
                  {flow.href}
                </span>
              </div>
              <p className="mt-1 text-sm">{flow.description}</p>
              <p className="text-muted-foreground mt-2 text-xs">
                <span className="font-medium">Stresses:</span> {flow.stresses}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

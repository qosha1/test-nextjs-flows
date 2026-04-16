import { AsyncListClient } from "./async-list-client";

export default async function AsyncListPage({
  searchParams,
}: {
  searchParams: Promise<{ empty?: string }>;
}) {
  const { empty } = await searchParams;
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Async list with retry</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Loading skeleton → success. Toggle &ldquo;Simulate failure&rdquo; to
        force the next load to error; the Retry button triggers a re-fetch.
        Add <code className="font-mono">?empty=1</code> to the URL for the
        empty state.
      </p>
      <div className="mt-8">
        <AsyncListClient empty={empty === "1"} />
      </div>
    </main>
  );
}

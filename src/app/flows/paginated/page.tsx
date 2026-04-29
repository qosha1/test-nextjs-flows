import { PaginatedClient } from "./paginated-client";

export default async function PaginatedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const initialPage = Math.max(1, parseInt(page ?? "1", 10));
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Paginated table</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Items are shown 2 per page. The current page is reflected in the URL
        (<code className="font-mono">?page=N</code>). Prev/Next buttons disable
        at the first and last pages respectively.
      </p>
      <div className="mt-8">
        <PaginatedClient initialPage={initialPage} />
      </div>
    </main>
  );
}

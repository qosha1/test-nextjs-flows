import { SearchClient } from "./search-client";

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Debounced search</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Input is debounced for 300ms. Rapid typing cancels in-flight requests
        via AbortController. Known queries: apple, banana, cherry.
      </p>
      <div className="mt-8">
        <SearchClient />
      </div>
    </main>
  );
}

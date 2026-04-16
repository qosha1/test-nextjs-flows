import { getLikes } from "@/lib/store";
import { OptimisticClient } from "./optimistic-client";

export default function OptimisticPage() {
  const initial = getLikes();
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Optimistic UI</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Clicking Like increments the count immediately. Items 1 and 2 always
        fail server-side and roll back with a toast. Items 3-5 always succeed.
      </p>
      <div className="mt-8">
        <OptimisticClient initial={initial} />
      </div>
    </main>
  );
}

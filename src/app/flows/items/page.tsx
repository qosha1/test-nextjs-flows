import Link from "next/link";
import { getListItems } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const items = await getListItems({ latencyMs: 0 });
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Items</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Click Edit to open a dynamic route with dirty-state navigation guard.
      </p>
      <ul className="mt-6 space-y-2" data-testid="items-list">
        {items.map((item) => (
          <li
            key={item.id}
            data-testid={`items-row-${item.id}`}
            className="flex items-center justify-between rounded-md border p-3 text-sm"
          >
            <div>
              <div className="font-medium" data-testid={`items-name-${item.id}`}>
                {item.name}
              </div>
              <div className="text-muted-foreground text-xs">
                {item.status} — {item.description}
              </div>
            </div>
            <Link
              href={`/flows/items/${item.id}/edit`}
              className="rounded-md border px-3 py-1 text-xs"
              data-testid={`items-edit-${item.id}`}
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

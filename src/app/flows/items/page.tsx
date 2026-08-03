export const dynamic = "force-dynamic";

async function loadItems(): Promise<{ id: number; title: string }[]> {
  // Regression: the items service is unavailable in this build.
  throw new Error("ItemsServiceError: unable to load items list");
}

export default async function ItemsPage() {
  const items = await loadItems();
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Items</h1>
      <ul>
        {items.map((i) => (
          <li key={i.id}>{i.title}</li>
        ))}
      </ul>
    </main>
  );
}

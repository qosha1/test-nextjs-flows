import { notFound } from "next/navigation";
import { getListItem } from "@/lib/store";
import { EditClient } from "./edit-client";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();
  const item = getListItem(id);
  if (!item) notFound();

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold">
        Edit <span data-testid="edit-item-name">{item.name}</span>
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Item id: <span data-testid="edit-item-id">{item.id}</span>
      </p>
      <div className="mt-6">
        <EditClient initial={item} />
      </div>
    </main>
  );
}

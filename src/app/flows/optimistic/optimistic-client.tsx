"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/lib/toast";

type Item = { id: number; title: string; likes: number };

export function OptimisticClient({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [pending, setPending] = useState<Set<number>>(new Set());
  const toast = useToast();

  const like = useCallback(
    async (id: number) => {
      if (pending.has(id)) return;
      setPending((p) => new Set(p).add(id));
      const prevLikes = items.find((i) => i.id === id)?.likes ?? 0;
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, likes: i.likes + 1 } : i)),
      );
      try {
        const res = await fetch(`/api/items/${id}/like`, { method: "POST" });
        if (!res.ok) {
          setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, likes: prevLikes } : i)),
          );
          toast.push({
            variant: "error",
            message: "Could not like — try again",
          });
        }
      } catch {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, likes: prevLikes } : i)),
        );
        toast.push({
          variant: "error",
          message: "Could not like — try again",
        });
      } finally {
        setPending((p) => {
          const next = new Set(p);
          next.delete(id);
          return next;
        });
      }
    },
    [items, pending, toast],
  );

  return (
    <ul className="space-y-3" data-testid="optimistic-list">
      {items.map((item) => (
        <li
          key={item.id}
          data-testid={`optimistic-item-${item.id}`}
          className="flex items-center justify-between rounded-md border p-3"
        >
          <span>{item.title}</span>
          <div className="flex items-center gap-3 text-sm">
            <span
              data-testid={`optimistic-count-${item.id}`}
              className="font-mono tabular-nums"
            >
              {item.likes}
            </span>
            <button
              type="button"
              onClick={() => like(item.id)}
              className="rounded-md border px-3 py-1 text-xs font-medium"
              data-testid={`optimistic-like-${item.id}`}
              aria-busy={pending.has(item.id)}
            >
              {pending.has(item.id) ? "…" : "Like"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

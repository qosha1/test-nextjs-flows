"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 2;

type Item = {
  id: number;
  name: string;
  status: string;
  description: string;
};

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "success"; items: Item[]; totalPages: number };

export function PaginatedClient({ initialPage }: { initialPage: number }) {
  const router = useRouter();
  const [page, setPage] = useState(initialPage);
  const [state, setState] = useState<State>({ kind: "loading" });

  const load = useCallback(async (p: number) => {
    setState({ kind: "loading" });
    try {
      const res = await fetch(
        `/api/items?page=${p}&pageSize=${PAGE_SIZE}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        setState({ kind: "error", message: `Request failed (${res.status})` });
        return;
      }
      const data = (await res.json()) as {
        items: Item[];
        totalPages: number;
      };
      setState({ kind: "success", items: data.items, totalPages: data.totalPages });
    } catch (e) {
      setState({ kind: "error", message: (e as Error).message });
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const go = (next: number) => {
    setPage(next);
    router.replace(`?page=${next}`, { scroll: false });
  };

  const totalPages = state.kind === "success" ? state.totalPages : null;
  const atFirst = page <= 1;
  const atLast = totalPages !== null && page >= totalPages;

  return (
    <div className="space-y-4">
      {state.kind === "loading" && (
        <div data-testid="paginated-loading" className="space-y-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-10 w-full animate-pulse rounded-md bg-muted"
              data-testid={`paginated-skeleton-${i}`}
            />
          ))}
        </div>
      )}

      {state.kind === "error" && (
        <div
          role="alert"
          data-testid="paginated-error"
          className="rounded-md border border-red-600/40 bg-red-600/10 p-4 text-sm"
        >
          Failed to load items: {state.message}
        </div>
      )}

      {state.kind === "success" && (
        <table className="w-full text-sm" data-testid="paginated-table">
          <thead className="text-muted-foreground text-xs uppercase">
            <tr>
              <th className="py-2 text-left">ID</th>
              <th className="py-2 text-left">Name</th>
              <th className="py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {state.items.map((item) => (
              <tr
                key={item.id}
                className="border-t"
                data-testid={`paginated-row-${item.id}`}
              >
                <td className="py-2">{item.id}</td>
                <td className="py-2">{item.name}</td>
                <td className="py-2">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={atFirst || state.kind === "loading"}
          data-testid="paginated-prev"
          className="rounded-md border px-3 py-1 text-xs font-medium disabled:opacity-40"
        >
          Prev
        </button>
        <span data-testid="paginated-page-info" className="text-muted-foreground text-xs">
          Page {page}{totalPages !== null ? ` of ${totalPages}` : ""}
        </span>
        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={atLast || state.kind === "loading"}
          data-testid="paginated-next"
          className="rounded-md border px-3 py-1 text-xs font-medium disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

type Item = {
  id: number;
  name: string;
  status: string;
  description: string;
};

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "empty" }
  | { kind: "success"; items: Item[] };

export function AsyncListClient({ empty }: { empty: boolean }) {
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [state, setState] = useState<State>({ kind: "loading" });

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const params = new URLSearchParams();
      if (empty) params.set("empty", "1");
      if (simulateFailure) params.set("fail", "1");
      const res = await fetch(`/api/items?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setState({ kind: "error", message: `Request failed (${res.status})` });
        return;
      }
      const data = (await res.json()) as { items: Item[] };
      if (data.items.length === 0) setState({ kind: "empty" });
      else setState({ kind: "success", items: data.items });
    } catch (e) {
      setState({ kind: "error", message: (e as Error).message });
    }
  }, [empty, simulateFailure]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch transitions state through loading → result/error
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={simulateFailure}
          onChange={(e) => setSimulateFailure(e.target.checked)}
          data-testid="async-list-fail-toggle"
        />
        Simulate failure on next load
      </label>

      {state.kind === "loading" && (
        <div data-testid="async-list-loading" className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-10 w-full animate-pulse rounded-md bg-muted"
              data-testid={`async-list-skeleton-${i}`}
            />
          ))}
        </div>
      )}

      {state.kind === "error" && (
        <div
          role="alert"
          data-testid="async-list-error"
          className="space-y-3 rounded-md border border-red-600/40 bg-red-600/10 p-4 text-sm"
        >
          <p>Failed to load items: {state.message}</p>
          <button
            type="button"
            onClick={load}
            className="rounded-md border px-3 py-1 text-xs font-medium"
            data-testid="async-list-retry"
          >
            Retry
          </button>
        </div>
      )}

      {state.kind === "empty" && (
        <p data-testid="async-list-empty" className="text-muted-foreground text-sm">
          No items yet
        </p>
      )}

      {state.kind === "success" && (
        <table className="w-full text-sm" data-testid="async-list-table">
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
                data-testid={`async-list-row-${item.id}`}
              >
                <td className="py-2">{item.id}</td>
                <td className="py-2">{item.name}</td>
                <td className="py-2">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

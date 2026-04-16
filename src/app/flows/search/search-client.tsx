"use client";

import { useEffect, useRef, useState } from "react";

type Result = { id: number; title: string; body: string };

const DEBOUNCE_MS = 300;

export function SearchClient() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [pending, setPending] = useState(false);
  const [isSuggestions, setIsSuggestions] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setPending(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
        cache: "no-store",
      })
        .then(async (res) => {
          const data = (await res.json()) as { results: Result[] };
          setResults(data.results);
          setIsSuggestions(q.trim() === "");
        })
        .catch((err) => {
          if ((err as Error).name !== "AbortError") {
            setResults([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setPending(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search (try 'apple', 'banana', 'cherry')"
          className="block w-full rounded-md border px-3 py-2 pr-10 text-sm"
          data-testid="search-input"
          autoComplete="off"
        />
        {pending && (
          <span
            className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground"
            data-testid="search-spinner"
            aria-label="Searching"
          >
            …
          </span>
        )}
      </div>

      {isSuggestions && (
        <p
          className="text-muted-foreground text-xs"
          data-testid="search-suggestions-label"
        >
          Featured results
        </p>
      )}

      <ul className="space-y-2" data-testid="search-results">
        {results.length === 0 && !pending && !isSuggestions ? (
          <li
            data-testid="search-empty"
            className="text-muted-foreground text-sm"
          >
            No matches
          </li>
        ) : null}
        {results.map((r) => (
          <li
            key={r.id}
            data-testid={`search-result-${r.id}`}
            className="rounded-md border p-3 text-sm"
          >
            <div className="font-medium">{r.title}</div>
            <div className="text-muted-foreground text-xs">{r.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

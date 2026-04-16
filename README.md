# test-nextjs-flows

Non-trivial Next.js App Router fixtures for evaluating the **DebuggAI** E2E
workflow against ground-truth behavior.

Each flow lives under `/flows/{name}` and is designed to stress a specific
capability the DebuggAI QA engine needs to get right: session persistence,
multi-step state, async timing, optimistic rollback, request cancellation,
modal stacking, dirty-state detection, and transient UI (toasts).

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # run production build
```

## Flows

| Route                         | Flow                      | Stresses                                                   |
| ----------------------------- | ------------------------- | ---------------------------------------------------------- |
| `/flows/auth`                 | Cookie session            | Persistence, redirects, protected routes                   |
| `/flows/wizard`               | 3-step form               | Multi-page state, URL-driven state, back-button            |
| `/flows/async-list`           | Loading / error / empty   | Timing-sensitive transitions, error vs empty               |
| `/flows/optimistic`           | Like with rollback        | State inversion under latency                              |
| `/flows/search`               | Debounced search          | Debounce window, request cancellation                      |
| `/flows/modals`               | Nested modal + Undo       | Stacking, focus trap, time-bounded actions                 |
| `/flows/items/[id]/edit`      | Dynamic route             | Param extraction, dirty-state navigation guard             |
| (cross-cutting)               | Toast system              | Ephemeral UI, timer-driven dismiss                         |

Full flow specification, including every expected behavior and edge case, is
tracked in the DebuggAI beads issue tracker (issue `full-platform-ebno`).

## Platform endpoints

| Endpoint                    | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| `GET /api/health`           | Health check — returns `{"status":"ok"}`  |
| `POST /api/reset`           | Clear in-memory state + cookies           |
| `POST /api/seed/{scenario}` | Preload state for a named scenario        |

`/api/reset` and `/api/seed/*` are not yet implemented (see bead `lmg4`).

## Testing

In-repo Playwright tests live under `tests/e2e/` and act as ground truth: any
disagreement between these tests and the DebuggAI platform's verdict is a
platform bug, not an app bug.

```bash
npm run test:e2e
```

## Non-goals

- No real backend — mock data with artificial latency via Next.js route handlers
- No third-party auth / analytics / fonts — builds offline-clean
- No production deployment story — this repo exists to be crawled and tested

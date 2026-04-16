/**
 * In-memory fixture state shared across all flows.
 *
 * Lives for the lifetime of the Next.js server process. Not safe under
 * multi-worker deployments, but this repo is a single-process fixture — any
 * horizontal scaling would defeat the deterministic-behavior contract
 * (E2E runs must see the same outcomes every time).
 */

export type ListItem = {
  id: number;
  name: string;
  status: "draft" | "active" | "archived";
  description: string;
};

export type LikeableItem = {
  id: number;
  title: string;
  likes: number;
};

export type Project = {
  id: number;
  name: string;
};

export type SearchDoc = {
  id: number;
  title: string;
  body: string;
};

type Store = {
  listItems: ListItem[];
  likes: LikeableItem[];
  projects: Project[];
  searchCorpus: SearchDoc[];
};

const DEFAULT_LIST_ITEMS: ListItem[] = [
  { id: 1, name: "Onboarding checklist", status: "active", description: "Get new hires ramped up." },
  { id: 2, name: "Q2 roadmap", status: "draft", description: "Plan the next quarter." },
  { id: 3, name: "Hiring plan", status: "active", description: "Backfill engineering roles." },
  { id: 4, name: "Legacy migration", status: "archived", description: "Retire the old system." },
  { id: 5, name: "Security audit", status: "active", description: "Annual pen test." },
];

const DEFAULT_LIKES: LikeableItem[] = [
  { id: 1, title: "Post about coffee", likes: 12 },
  { id: 2, title: "Post about running", likes: 5 },
  { id: 3, title: "Post about books", likes: 27 },
  { id: 4, title: "Post about music", likes: 3 },
  { id: 5, title: "Post about travel", likes: 18 },
];

const DEFAULT_PROJECTS: Project[] = [
  { id: 1, name: "Phoenix" },
  { id: 2, name: "Aurora" },
  { id: 3, name: "Vega" },
];

const DEFAULT_SEARCH_CORPUS: SearchDoc[] = [
  { id: 1, title: "Apple varieties", body: "A quick primer on apple cultivars." },
  { id: 2, title: "Applesauce recipes", body: "Three ways to cook applesauce." },
  { id: 3, title: "Banana bread", body: "Classic banana bread recipe." },
  { id: 4, title: "Banana smoothie", body: "A quick banana smoothie." },
  { id: 5, title: "Cherry pie", body: "Lattice-top cherry pie." },
  { id: 6, title: "Cherry tomato salad", body: "Bright salad with cherry tomatoes." },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function freshStore(): Store {
  return {
    listItems: clone(DEFAULT_LIST_ITEMS),
    likes: clone(DEFAULT_LIKES),
    projects: clone(DEFAULT_PROJECTS),
    searchCorpus: clone(DEFAULT_SEARCH_CORPUS),
  };
}

const GLOBAL_KEY = Symbol.for("test-nextjs-flows.store");
type GlobalWithStore = typeof globalThis & { [GLOBAL_KEY]?: Store };
const g = globalThis as GlobalWithStore;

function getStore(): Store {
  if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = freshStore();
  return g[GLOBAL_KEY]!;
}

export function resetStore(): void {
  g[GLOBAL_KEY] = freshStore();
}

export function applyScenario(scenario: string): { applied: boolean } {
  const store = getStore();
  switch (scenario) {
    case "empty-list":
      store.listItems = [];
      return { applied: true };
    case "all-archived":
      store.listItems = store.listItems.map((i) => ({ ...i, status: "archived" }));
      return { applied: true };
    default:
      return { applied: false };
  }
}

export async function getListItems(
  opts: { empty?: boolean; shouldFail?: boolean; latencyMs?: number } = {},
): Promise<ListItem[]> {
  await new Promise((r) => setTimeout(r, opts.latencyMs ?? 600));
  if (opts.shouldFail) throw new Error("Simulated list load failure");
  if (opts.empty) return [];
  return clone(getStore().listItems);
}

export function getListItem(id: number): ListItem | null {
  const found = getStore().listItems.find((i) => i.id === id);
  return found ? clone(found) : null;
}

export async function updateListItem(
  id: number,
  patch: Partial<Pick<ListItem, "name" | "status" | "description">>,
): Promise<ListItem | null> {
  await new Promise((r) => setTimeout(r, 300));
  const store = getStore();
  const idx = store.listItems.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  store.listItems[idx] = { ...store.listItems[idx], ...patch };
  return clone(store.listItems[idx]);
}

export function getLikes(): LikeableItem[] {
  return clone(getStore().likes);
}

/**
 * Deterministic: items 1 and 2 always fail, 3-5 always succeed.
 */
export async function toggleLike(
  id: number,
): Promise<{ ok: boolean; item: LikeableItem | null }> {
  await new Promise((r) => setTimeout(r, 400));
  const store = getStore();
  const item = store.likes.find((i) => i.id === id);
  if (!item) return { ok: false, item: null };
  if (id === 1 || id === 2) return { ok: false, item: clone(item) };
  item.likes += 1;
  return { ok: true, item: clone(item) };
}

export function getProjects(): Project[] {
  return clone(getStore().projects);
}

export function deleteProject(id: number): Project | null {
  const store = getStore();
  const idx = store.projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const [removed] = store.projects.splice(idx, 1);
  return clone(removed);
}

export function restoreProject(project: Project, atIndex: number): void {
  const store = getStore();
  const clamped = Math.max(0, Math.min(atIndex, store.projects.length));
  store.projects.splice(clamped, 0, clone(project));
}

export async function search(q: string): Promise<SearchDoc[]> {
  await new Promise((r) => setTimeout(r, 200));
  const query = q.trim().toLowerCase();
  if (!query) return clone(getStore().searchCorpus.slice(0, 3));
  return clone(
    getStore().searchCorpus.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        d.body.toLowerCase().includes(query),
    ),
  );
}

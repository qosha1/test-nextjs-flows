import { getProjects } from "@/lib/store";
import { ModalsClient } from "./modals-client";

export default function ModalsPage() {
  const initial = getProjects();
  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Modal stack</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Delete opens a confirm dialog. Continue opens a second, nested dialog
        requiring you to type the project name. After confirming, a 5-second
        Undo toast appears.
      </p>
      <div className="mt-8">
        <ModalsClient initial={initial} />
      </div>
    </main>
  );
}

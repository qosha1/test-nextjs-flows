"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/lib/toast";

type Project = { id: number; name: string };

async function apiDelete(id: number): Promise<boolean> {
  const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
  return res.ok;
}

async function apiRestore(
  project: Project,
  index: number,
): Promise<boolean> {
  const res = await fetch(`/api/projects/${project.id}/restore`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ project, index }),
  });
  return res.ok;
}

export function ModalsClient({ initial }: { initial: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initial);
  const [firstOpen, setFirstOpen] = useState<Project | null>(null);
  const [secondOpen, setSecondOpen] = useState<Project | null>(null);
  const [typedName, setTypedName] = useState("");
  const confirmInputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();

  const resetDialogs = useCallback(() => {
    setFirstOpen(null);
    setSecondOpen(null);
    setTypedName("");
  }, []);

  useEffect(() => {
    if (!firstOpen && !secondOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (secondOpen) setSecondOpen(null);
        else if (firstOpen) setFirstOpen(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [firstOpen, secondOpen]);

  useEffect(() => {
    if (secondOpen) confirmInputRef.current?.focus();
  }, [secondOpen]);

  const performDelete = useCallback(
    async (project: Project, atIndex: number) => {
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      resetDialogs();
      const ok = await apiDelete(project.id);
      if (!ok) {
        setProjects((prev) => {
          const next = [...prev];
          next.splice(atIndex, 0, project);
          return next;
        });
        toast.push({ variant: "error", message: "Delete failed" });
        return;
      }
      toast.push({
        variant: "action",
        message: `Deleted "${project.name}"`,
        actionLabel: "Undo",
        durationMs: 5000,
        onAction: async () => {
          const restored = await apiRestore(project, atIndex);
          if (restored) {
            setProjects((prev) => {
              const next = [...prev];
              next.splice(atIndex, 0, project);
              return next;
            });
          }
        },
      });
    },
    [toast, resetDialogs],
  );

  return (
    <div>
      <ul className="space-y-2" data-testid="modals-project-list">
        {projects.map((project, index) => (
          <li
            key={project.id}
            data-testid={`modals-project-${project.id}`}
            className="flex items-center justify-between rounded-md border p-3 text-sm"
          >
            <span>{project.name}</span>
            <button
              type="button"
              onClick={() => {
                setFirstOpen(project);
                setTypedName("");
              }}
              className="rounded-md border px-3 py-1 text-xs font-medium"
              data-testid={`modals-delete-${project.id}`}
              data-index={index}
            >
              Delete
            </button>
          </li>
        ))}
        {projects.length === 0 && (
          <li
            className="text-muted-foreground text-sm"
            data-testid="modals-empty"
          >
            No projects left
          </li>
        )}
      </ul>

      {firstOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modals-first-title"
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
          data-testid="modals-first"
        >
          <div className="bg-background w-full max-w-sm rounded-md border p-6">
            <h2 id="modals-first-title" className="text-lg font-medium">
              Delete Project &ldquo;{firstOpen.name}&rdquo;?
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              This action requires confirmation.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetDialogs}
                className="rounded-md border px-3 py-1 text-sm"
                data-testid="modals-first-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSecondOpen(firstOpen);
                }}
                className="rounded-md bg-foreground px-3 py-1 text-sm text-background"
                data-testid="modals-first-continue"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {secondOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modals-second-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          data-testid="modals-second"
        >
          <div className="bg-background w-full max-w-sm rounded-md border p-6">
            <h2 id="modals-second-title" className="text-lg font-medium">
              This cannot be undone
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Type <span className="font-mono">{secondOpen.name}</span> to
              confirm.
            </p>
            <input
              ref={confirmInputRef}
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="mt-3 block w-full rounded-md border px-3 py-2 text-sm"
              data-testid="modals-confirm-input"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetDialogs}
                className="rounded-md border px-3 py-1 text-sm"
                data-testid="modals-second-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={typedName !== secondOpen.name}
                onClick={() => {
                  const index = projects.findIndex(
                    (p) => p.id === secondOpen.id,
                  );
                  performDelete(secondOpen, index);
                }}
                className="rounded-md bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-40"
                data-testid="modals-second-confirm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

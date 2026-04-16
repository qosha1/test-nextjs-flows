"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";

type Item = {
  id: number;
  name: string;
  status: "draft" | "active" | "archived";
  description: string;
};

async function apiSave(item: Item): Promise<boolean> {
  const res = await fetch(`/api/items/${item.id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: item.name,
      status: item.status,
      description: item.description,
    }),
  });
  return res.ok;
}

export function EditClient({ initial }: { initial: Item }) {
  const router = useRouter();
  const toast = useToast();
  const [item, setItem] = useState<Item>(initial);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const onChange = <K extends keyof Item>(key: K, value: Item[K]) => {
    setItem((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const onSave = async () => {
    setSaving(true);
    const ok = await apiSave(item);
    setSaving(false);
    if (!ok) {
      toast.push({ variant: "error", message: "Save failed" });
      return;
    }
    setDirty(false);
    toast.push({ variant: "success", message: "Saved" });
    router.push("/flows/items");
    router.refresh();
  };

  const onCancel = () => {
    if (dirty) {
      const leave = window.confirm(
        "You have unsaved changes. Leave this page?",
      );
      if (!leave) return;
    }
    router.push("/flows/items");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="space-y-4"
      data-testid="edit-form"
    >
      <div>
        <label className="block text-sm font-medium" htmlFor="edit-name">
          Name
        </label>
        <input
          id="edit-name"
          value={item.name}
          onChange={(e) => onChange("name", e.target.value)}
          className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
          data-testid="edit-name-input"
        />
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="edit-status">
          Status
        </label>
        <select
          id="edit-status"
          value={item.status}
          onChange={(e) => onChange("status", e.target.value as Item["status"])}
          className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
          data-testid="edit-status-select"
        >
          <option value="draft">draft</option>
          <option value="active">active</option>
          <option value="archived">archived</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="edit-description">
          Description
        </label>
        <textarea
          id="edit-description"
          value={item.description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
          data-testid="edit-description-textarea"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
          data-testid="edit-save"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border px-4 py-2 text-sm font-medium"
          data-testid="edit-cancel"
        >
          Cancel
        </button>
      </div>
      {dirty && (
        <p
          className="text-muted-foreground text-xs"
          data-testid="edit-dirty-indicator"
        >
          Unsaved changes
        </p>
      )}
    </form>
  );
}

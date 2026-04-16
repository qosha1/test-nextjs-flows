"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ToastVariant = "success" | "error" | "action";

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  durationMs: number;
};

type ToastInput = Omit<Toast, "id" | "durationMs"> & { durationMs?: number };

type ToastContextValue = {
  push: (toast: ToastInput) => number;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 4000;
const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((input: ToastInput): number => {
    const id = ++idRef.current;
    const toast: Toast = {
      id,
      message: input.message,
      variant: input.variant,
      actionLabel: input.actionLabel,
      onAction: input.onAction,
      durationMs: input.durationMs ?? DEFAULT_DURATION_MS,
    };
    setToasts((prev) => [...prev, toast].slice(-MAX_VISIBLE));
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2"
      data-testid="toast-viewport"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const h = setTimeout(() => onDismiss(toast.id), toast.durationMs);
    return () => clearTimeout(h);
  }, [toast.id, toast.durationMs, onDismiss]);

  const variantStyles: Record<ToastVariant, string> = {
    success: "border-emerald-600/40 bg-emerald-600/10 text-emerald-100",
    error: "border-red-600/40 bg-red-600/10 text-red-100",
    action: "border-sky-600/40 bg-sky-600/10 text-sky-100",
  };

  return (
    <div
      role="status"
      data-testid={`toast-${toast.variant}`}
      className={`pointer-events-auto flex items-center justify-between gap-3 rounded-md border bg-background px-4 py-2 text-sm shadow-lg ${variantStyles[toast.variant]}`}
    >
      <span className="flex-1">{toast.message}</span>
      {toast.actionLabel && toast.onAction ? (
        <button
          type="button"
          onClick={() => {
            toast.onAction?.();
            onDismiss(toast.id);
          }}
          className="rounded px-2 py-1 text-xs font-medium underline-offset-2 hover:underline"
          data-testid={`toast-action-${toast.variant}`}
        >
          {toast.actionLabel}
        </button>
      ) : null}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(toast.id)}
        className="ml-1 rounded px-1 text-xs opacity-70 hover:opacity-100"
        data-testid="toast-dismiss"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

// Errors linger longer than successes so they're less likely to be missed.
const DURATION: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismiss(id), DURATION[type]);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.type === "error" ? "alert" : "status"}
          className={`animate-fade-in pointer-events-auto flex items-start gap-3 rounded-xl border border-border border-l-4 bg-surface-raised p-3 shadow-glow-sm ${
            t.type === "error" ? "border-l-loss" : "border-l-win"
          }`}
        >
          <span
            aria-hidden
            className={`mt-0.5 shrink-0 ${
              t.type === "error" ? "text-loss" : "text-win"
            }`}
          >
            {t.type === "error" ? <ErrorIcon /> : <SuccessIcon />}
          </span>
          <p className="min-w-0 flex-1 text-sm text-foreground">{t.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 cursor-pointer rounded-md p-0.5 text-faint transition hover:text-foreground"
          >
            <CloseIcon />
          </button>
        </div>
      ))}
    </div>
  );
}

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function SuccessIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 8.5l3 3 7-7" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 5v3.5M8 11h.01" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

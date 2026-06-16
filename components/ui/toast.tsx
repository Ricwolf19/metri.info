"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import {
  AlertTriangleIcon,
  CheckIcon,
  InfoIcon,
  XIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type Toast = ToastOptions & { id: number; variant: ToastVariant };

type ToastContextValue = { toast: (options: ToastOptions) => void };

const AUTO_DISMISS_MS = 4000;

const ToastContext = createContext<ToastContextValue | null>(null);

const noopSubscribe = () => () => {};

/** True once hydrated on the client — gates the body portal without a
 * setState-in-effect (which ESLint forbids). */
const useIsMounted = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

const VARIANT_STYLES: Record<
  ToastVariant,
  { container: string; icon: string; Icon: typeof CheckIcon }
> = {
  success: {
    container: "border-lime-400/40 bg-ink-900 text-ink-50",
    icon: "text-accent",
    Icon: CheckIcon,
  },
  error: {
    container: "border-red-500/50 bg-ink-900 text-ink-50",
    icon: "text-red-500",
    Icon: AlertTriangleIcon,
  },
  info: {
    container: "border-ink-600 bg-ink-900 text-ink-50",
    icon: "text-ink-200",
    Icon: InfoIcon,
  },
};

const ToastCard = ({
  toast,
  onClose,
  closeLabel,
}: {
  toast: Toast;
  onClose: (id: number) => void;
  closeLabel: string;
}) => {
  const { container, icon, Icon } = VARIANT_STYLES[toast.variant];
  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full [animation:metri-toast-in_0.22s_cubic-bezier(0.22,1,0.36,1)] items-start gap-3 rounded-card border px-4 py-3 shadow-2xl",
        container,
      )}
    >
      <span className={cn("mt-0.5 shrink-0", icon)}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 text-xs text-ink-300">{toast.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        aria-label={closeLabel}
        className="-mr-1 shrink-0 rounded-md p-1 text-ink-400 transition-colors hover:text-ink-100 focus-visible:ring-2 focus-visible:ring-ink-500/50 focus-visible:outline-none"
      >
        <XIcon size={14} />
      </button>
    </div>
  );
};

/**
 * App-wide toast system — a fixed portal that stacks transient feedback for
 * server-action results. Bottom-right on desktop, full-width bottom on mobile.
 * Each toast auto-dismisses after ~4s and can be closed manually. Timers are
 * cleared on unmount and on manual close to avoid leaks.
 */
export const ToastProvider = ({
  children,
  closeLabel = "Dismiss",
}: {
  children: React.ReactNode;
  closeLabel?: string;
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const mounted = useIsMounted();
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info" }: ToastOptions) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const active = timers.current;
    return () => {
      for (const timer of active.values()) clearTimeout(timer);
      active.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-stretch gap-2 p-4 sm:inset-x-auto sm:right-0 sm:bottom-0 sm:w-[22rem] sm:max-w-[calc(100vw-2rem)]"
          >
            {toasts.map((t) => (
              <ToastCard
                key={t.id}
                toast={t}
                onClose={dismiss}
                closeLabel={closeLabel}
              />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
};

/** Access the toast dispatcher. No-op safe: returns a noop outside a provider. */
export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: () => {} };
  return ctx;
};

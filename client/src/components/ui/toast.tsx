import * as React from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "destructive";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastItem = ToastInput & { id: string };

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((input: ToastInput) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, ...input }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            className={cn(
              "rounded-2xl border bg-white p-4 shadow-2xl",
              toastItem.variant === "destructive" ? "border-danger/20" : "border-slate-200",
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("mt-0.5", toastItem.variant === "destructive" ? "text-danger" : "text-success")}>
                {toastItem.variant === "destructive" ? <CircleAlert className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-950">{toastItem.title}</p>
                {toastItem.description ? <p className="mt-1 text-sm text-slate-500">{toastItem.description}</p> : null}
              </div>
              <button
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setToasts((current) => current.filter((item) => item.id !== toastItem.id))}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (value: boolean) => void; children: React.ReactNode }) {
  return <DialogContext.Provider value={{ open, setOpen: onOpenChange }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
  const context = React.useContext(DialogContext);

  if (!context) {
    throw new Error("DialogTrigger must be used within Dialog");
  }

  return (
    <button onClick={() => context.setOpen(true)} type="button">
      {children}
    </button>
  );
}

export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const context = React.useContext(DialogContext);

  if (!context) {
    throw new Error("DialogContent must be used within Dialog");
  }

  if (!context.open) {
    return null;
  }

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        context.setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [context]);

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <button
        aria-label="Close dialog"
        className="absolute inset-0 cursor-default bg-slate-950/50"
        onClick={() => context.setOpen(false)}
        type="button"
      />
      <div className={cn("relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl", className)}>
        <button
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => context.setOpen(false)}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-6 pr-8", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-xl font-semibold text-slate-950", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-slate-500", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex items-center justify-end gap-3", className)} {...props} />;
}
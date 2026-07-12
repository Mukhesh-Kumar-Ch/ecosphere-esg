import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode }) {
  return <TabsContext.Provider value={{ value, setValue: onValueChange }}>{children}</TabsContext.Provider>;
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex rounded-xl bg-slate-100 p-1", className)} {...props} />;
}

export function TabsTrigger({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const active = context.value === value;

  return (
    <button
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-medium transition",
        active ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-950",
        className,
      )}
      onClick={() => context.setValue(value)}
      type="button"
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const context = React.useContext(TabsContext);

  if (!context || context.value !== value) {
    return null;
  }

  return <div className={cn("mt-6", className)}>{children}</div>;
}
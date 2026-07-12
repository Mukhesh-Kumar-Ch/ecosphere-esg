import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-primary text-white hover:opacity-95 shadow-soft",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      outline: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
      ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
    }[variant];

    const sizeClasses = {
      default: "h-11 px-4 py-2",
      sm: "h-9 px-3",
      lg: "h-12 px-6",
    }[size];

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
          variantClasses,
          sizeClasses,
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

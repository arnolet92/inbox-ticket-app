import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost" | "accent" | "destructive", size?: "sm" | "default" | "lg", isLoading?: boolean }
>(({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20",
    outline: "border-2 border-border bg-transparent hover:bg-muted text-foreground",
    ghost: "bg-transparent hover:bg-muted text-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
  };
  const sizes = {
    sm: "h-9 px-4 text-sm",
    default: "h-11 px-6",
    lg: "h-14 px-8 text-lg font-semibold"
  };
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
});
Button.displayName = "Button";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-12 w-full rounded-xl border-2 border-border bg-input/50 px-4 py-2 text-sm text-foreground transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-accent focus-visible:bg-input disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-12 w-full rounded-xl border-2 border-border bg-input/50 px-4 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-accent focus-visible:bg-input disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Select.displayName = "Select";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-xl border-2 border-border bg-input/50 px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-accent focus-visible:bg-input disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground/90", className)} {...props} />
  )
);
Label.displayName = "Label";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card text-card-foreground shadow-xl shadow-black/20 overflow-hidden transition-all duration-300 hover:border-border", className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default"| "success" | "warning" | "destructive" | "outline" }) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    success: "bg-[#00b050]/20 text-[#00b050] border border-[#00b050]/30",
    warning: "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30",
    destructive: "bg-destructive/20 text-destructive border border-destructive/30",
    outline: "text-foreground border border-border"
  };
  return (
    <div className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)} {...props} />
  );
}

export function Dialog({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold font-display mb-6">{title}</h2>
        {children}
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          &times;
        </button>
      </div>
    </div>
  );
}

export function Table({ children, className }: React.HTMLAttributes<HTMLTableElement>) {
  return <div className="w-full overflow-auto"><table className={cn("w-full caption-bottom text-sm", className)}>{children}</table></div>;
}
export function TableHeader({ children }: React.HTMLAttributes<HTMLTableSectionElement>) { return <thead className="[&_tr]:border-b [&_tr]:border-border">{children}</thead>; }
export function TableBody({ children }: React.HTMLAttributes<HTMLTableSectionElement>) { return <tbody className="[&_tr:last-child]:border-0">{children}</tbody>; }
export function TableRow({ children, className }: React.HTMLAttributes<HTMLTableRowElement>) { return <tr className={cn("border-b border-border/50 transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted", className)}>{children}</tr>; }
export function TableHead({ children, className }: React.ThHTMLAttributes<HTMLTableCellElement>) { return <th className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground", className)}>{children}</th>; }
export function TableCell({ children, className }: React.TdHTMLAttributes<HTMLTableCellElement>) { return <td className={cn("p-4 align-middle", className)}>{children}</td>; }

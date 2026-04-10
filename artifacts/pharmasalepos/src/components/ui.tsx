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
  ({ className, ...props }, ref) => (
    <input
      className={cn(
        "flex h-12 w-full rounded-xl border-2 border-border bg-input/50 px-4 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-accent focus-visible:bg-input disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      className={cn(
        "flex h-12 w-full rounded-xl border-2 border-border bg-input/50 px-4 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:border-accent focus-visible:bg-input disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Select.displayName = "Select";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-xl border-2 border-border bg-input/50 px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-accent focus-visible:bg-input disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      ref={ref}
      {...props}
    />
  )
);
Label.displayName = "Label";

export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-black/20", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "outline" | "success" | "warning" | "destructive";
  className?: string;
}) {
  const variants = {
    default: "bg-primary/20 text-primary-foreground border-primary/30",
    outline: "bg-transparent border-border text-muted-foreground",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    destructive: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)}>
      {children}
    </span>
  );
}

export function Dialog({
  isOpen, onClose, title, subtitle, icon, children, maxWidth = "sm:max-w-lg",
}: {
  isOpen: boolean; onClose: () => void; title: string;
  subtitle?: string; icon?: React.ReactNode;
  children: React.ReactNode; maxWidth?: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/88 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />
      <div
        className={cn("relative z-50 w-full rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.95)] animate-in fade-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300", maxWidth)}
        style={{ background: "hsl(150 15% 6%)", border: "1.5px solid hsl(145 60% 22% / 0.45)" }}
      >
        {/* Top accent glow line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent" />
        {/* Subtle tiled pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg,hsl(145 80% 50%) 0,hsl(145 80% 50%) 1px,transparent 0,transparent 50%)", backgroundSize: "10px 10px" }} />
        {/* Corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle, hsl(145 80% 50%), transparent 70%)", transform: "translate(30%,-30%)" }} />

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "hsl(145 40% 14% / 0.9)" }}>
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-accent"
                style={{ background: "hsl(145 60% 10%)", border: "1.5px solid hsl(145 60% 28% / 0.5)", boxShadow: "0 0 16px hsl(145 80% 30% / 0.2)" }}>
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-xl font-bold font-display tracking-tight leading-tight">{title}</h2>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-white transition-all duration-150 shrink-0 ml-3 group"
            style={{ background: "hsl(145 20% 10%)", border: "1px solid hsl(145 30% 16% / 0.6)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-200"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="relative px-6 py-5 max-h-[82vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DeleteModal({ isOpen, onClose, onConfirm, title, description }: {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  title: string; description: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/88 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative z-50 w-full max-w-sm rounded-2xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 duration-300 p-6"
        style={{ background: "hsl(150 15% 6%)", border: "1.5px solid hsl(0 60% 30% / 0.4)" }}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "hsl(0 60% 10%)", border: "1.5px solid hsl(0 60% 30% / 0.5)", boxShadow: "0 0 20px hsl(0 80% 30% / 0.2)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="hsl(0 70% 60%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </div>
          <h2 className="text-lg font-bold font-display mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground mb-6">{description}</p>
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
              style={{ border: "1.5px solid hsl(145 30% 16%)", color: "hsl(145 20% 70%)" }}>Annuler</button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "hsl(0 65% 40%)", border: "1.5px solid hsl(0 65% 50% / 0.4)" }}>Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("w-full overflow-auto", className)}>
    <table className="w-full caption-bottom text-sm">{children}</table>
  </div>
);
export const TableHeader = ({ children }: { children: React.ReactNode }) => <thead className="[&_tr]:border-b">{children}</thead>;
export const TableBody = ({ children }: { children: React.ReactNode }) => <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
export const TableRow = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tr className={cn("border-b border-border/40 transition-colors hover:bg-muted/30", className)}>{children}</tr>
);
export const TableHead = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <th className={cn("h-12 px-4 text-left align-middle font-semibold text-muted-foreground", className)}>{children}</th>
);
export const TableCell = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={cn("p-4 align-middle", className)}>{children}</td>
);

import * as React from "react";

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const base =
    "inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-semibold transition-colors disabled:opacity-60 disabled:pointer-events-none";

  const styles =
    variant === "primary"
      ? "bg-[color:var(--accent)] text-white hover:brightness-110"
      : variant === "secondary"
        ? "border border-[color:var(--border)] bg-[color:var(--surface)] text-foreground hover:bg-[color:var(--surface-2)]"
        : "text-foreground hover:bg-[color:var(--surface-2)]";

  return <button className={[base, styles, className ?? ""].join(" ")} {...props} />;
}


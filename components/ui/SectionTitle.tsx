import * as React from "react";

import { Link } from "../../i18n/navigation";

export function SectionTitle({
  title,
  title2,
  actionLabel,
  actionHref,
  uppercase = true,
}: {
  title: string;
  title2: string;
  actionLabel?: string;
  actionHref?: string;
  uppercase?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <h2
        className={
          uppercase
            ? "text-sm tracking-widest text-foreground sm:text-base"
            : "text-base font-semibold tracking-wide text-foreground"
        }
      >
        {uppercase ? title.toUpperCase() : title}
      </h2>
      <h1 className={
        uppercase
          ? "text-sm font-bold tracking-widest text-red-600 sm:text-base"
          : "text-base font-semibold tracking-wide text-foreground"
      }
      >
        {title2}</h1>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--muted)] hover:text-foreground"
        >
          {actionLabel}
          <span className="w-[10px] h-[10px] bg-red-600" aria-hidden>»</span>
        </Link>
      ) : null}
    </div>
  );
}


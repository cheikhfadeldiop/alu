import * as React from "react";
import { Link } from "../../i18n/navigation";
import { SITE_CONFIG } from "@/constants/site-config";
import { SafeImage } from "./SafeImage";

export function SectionTitle({
  title,
  title2,
  actionLabel,
  actionHref,
  actionIcon = true,
  uppercase = true,
  className,
}: {
  title: string;
  title2?: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: boolean;
  uppercase?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 pb-6 ${className}`}>
      <h2
        className={
          uppercase
            ? "text-sm tracking-widest text-foreground sm:text-base " + className
            : "text-base font-semibold tracking-wide text-foreground " + className
        }
      >
        {uppercase ? title.toUpperCase() : title}
      </h2>
      <h1 className={
        uppercase
          ? "text-sm font-bold tracking-widest text-[color:var(--accent)] sm:text-base"
          : "text-base font-semibold tracking-wide text-foreground"
      }
      >
        {title2}</h1>
      {actionIcon && title ? (
        <Link
          href={actionHref || "#"}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--muted)] hover:text-foreground"
        >
          {actionLabel}
          <div className="text-gray-400">
            <SafeImage
              src={SITE_CONFIG.theme.placeholders.arrow}
              alt=""
              width={24}
              height={24}
            />
          </div>
        </Link>
      ) : null}
    </div>
  );
}


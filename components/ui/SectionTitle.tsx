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
  uppercase2 = true,

  className,
}: {
  title: string;
  title2?: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: boolean;
  uppercase?: boolean;
  uppercase2?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 pb-6 ${className}`}>
      <h2
        className={
          uppercase
            ? "text-xs sm:text-sm tracking-widest text-foreground " + className
            : "text-sm sm:text-base font-semibold tracking-wide text-foreground " + className
        }
      >
        {uppercase ? title.toUpperCase() : title}
      </h2>
      <h1 className={
        uppercase2
          ? "text-xs sm:text-sm font-bold tracking-widest text-[color:var(--accent)] sm:text-base"
          : "text-sm sm:text-base font-semibold tracking-wide text-foreground"
      }
      >
        {uppercase2 ? title2?.toUpperCase() : title2}</h1>
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


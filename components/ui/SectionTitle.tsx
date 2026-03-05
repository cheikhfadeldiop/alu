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
    <div className={`flex items-center gap-m pb-l ${className}`}>
      <h2
        className={
          uppercase
            ? "b1 tracking-widest text-foreground " + className
            : "b1 font-semibold tracking-wide text-foreground " + className
        }
      >
        {uppercase ? title.toUpperCase() : title}
      </h2>
      <h1 className={
        uppercase2
          ? "b1 font-bold tracking-widest text-accent"
          : "b1 font-semibold tracking-wide text-foreground"
      }
      >
        {uppercase2 ? title2?.toUpperCase() : title2}</h1>
      {actionIcon && title ? (
        <Link
          href={actionHref || "#"}
          className="inline-flex items-center gap-xxs b4 font-semibold text-muted hover:text-accent transition-colors"
        >
          {actionLabel}
          <div className="opacity-90 group-hover:opacity-100 transition-opacity">
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


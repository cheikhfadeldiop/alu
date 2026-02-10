import * as React from "react";

import { Link } from "../../i18n/navigation";
import Image from "next/image";

export function SectionTitle({
  title,
  title2,
  actionLabel,
  actionHref,
  actionIcon = true,
  uppercase = true,
}: {
  title: string;
  title2?: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: boolean;
  uppercase?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 pb-6 ">
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
      {actionIcon && title ? (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--muted)] hover:text-foreground"
        >
          {actionLabel}
          <div className="text-gray-400">
            <Image
              src="/assets/placeholders/arrow2.png"
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


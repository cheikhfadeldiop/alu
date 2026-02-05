import * as React from "react";
import { useTranslations } from "next-intl";

export function LiveBadge({ className }: { className?: string }) {
  const t = useTranslations("common");
  return (
    <span
      className={[
        "inline-flex items-center rounded-full bg-[color:var(--accent)] px-2 py-1 text-[10px] font-bold tracking-widest text-white",
        className ?? "",
      ].join(" ")}
    >
      {t("live")}
    </span>
  );
}


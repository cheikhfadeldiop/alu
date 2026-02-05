"use client";

import * as React from "react";

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_70%,transparent)] p-1">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={[
              "h-9 rounded-full px-4 text-sm font-semibold transition-colors",
              active
                ? "bg-[color:var(--surface)] text-foreground"
                : "text-[color:var(--muted)] hover:text-foreground",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}


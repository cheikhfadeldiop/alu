"use client";

import * as React from "react";

export function Carousel({
  children,
  itemClassName = "w-[280px] sm:w-[320px]",
  showArrows = true, // 👈 nouveau param
}: {
  children: React.ReactNode;
  itemClassName?: string;
  showArrows?: boolean; // 👈 typage
}) {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);

  const scrollBy = (delta: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="relative">
      
      {showArrows && ( // 👈 condition ajoutée
        <div className="absolute right-2 top-[-44px] hidden gap-2 sm:flex">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-2)]"
            onClick={() => scrollBy(-420)}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-2)]"
            onClick={() => scrollBy(420)}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-2 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {React.Children.map(children, (child, idx) => (
          <div
            key={idx}
            className={["shrink-0", itemClassName].join(" ")}
            style={{ scrollSnapAlign: "start" }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
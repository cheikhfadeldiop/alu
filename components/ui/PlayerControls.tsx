"use client";

import * as React from "react";

function IconPlay(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M10 8v8l7-4-7-4Z" fill="currentColor" />
    </svg>
  );
}

function IconPause(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M8 7h3v10H8V7Zm5 0h3v10h-3V7Z" fill="currentColor" />
    </svg>
  );
}

export function PlayerControls({
  playing,
  onToggle,
}: {
  playing: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--surface)_85%,transparent)] text-foreground shadow-sm ring-1 ring-[color:var(--border)] hover:bg-[color:var(--surface)]"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <IconPause className="h-6 w-6" /> : <IconPlay className="h-6 w-6" />}
      </button>
    </div>
  );
}


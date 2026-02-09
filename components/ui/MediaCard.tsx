import * as React from "react";
import Image from "next/image";

import { Link } from "../../i18n/navigation";
import { LiveBadge } from "./LiveBadge";

export type MediaCardProps = {
  href: string;
  title: string;
  imageSrc: string;
  meta?: string;
  live?: boolean;
  showPlayIcon?: boolean;
  aspect?: "16/9" | "4/3" | "1/1" | "469/246";
};

function aspectClass(aspect: MediaCardProps["aspect"]) {
  switch (aspect) {
    case "1/1":
      return "aspect-square";
    case "4/3":
      return "aspect-[4/3]";
    case "469/246":
      return "aspect-[469/246]";
    case "16/9":
    default:
      return "aspect-video";
  }
}

function PlayOverlay() {
  return (
    <div
      className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 l transition-transform group-hover:scale-110"
      aria-hidden
    >
      <Image
        src="/assets/placeholders/play_overlay.png"
        alt="CRTV"
        width={32}
        height={32}
        className="h-12 w-12"
        priority
        objectFit="contain"
      />
    </div>
  );
}

export function MediaCard({
  href,
  title,
  imageSrc,
  meta,
  live,
  showPlayIcon = false,
  aspect = "16/9",
}: MediaCardProps) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden  bg-background/30 backdrop-blur-xl hover:scale-105 transition-transform hover:z-10 "
    >
      <div className={["relative w-full overflow-hidden", aspectClass(aspect)].join(" ")}>
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover "
        />

        {live ? (
          <div className="absolute left-3 top-3 z-10">
            <LiveBadge />
          </div>
        ) : null}
        {showPlayIcon ? (
          <div className="absolute inset-0 z-[1]">
            <PlayOverlay />
          </div>
        ) : null}
      </div>

      <div className="space-y-1 p-4 justify-between">
        <div className="line-clamp-1 text-sm font-semibold leading-6 text-foreground ">
          {title}
        </div>
        {meta ? (
          <div className="flex items-center gap-2">
            <div className="text-xs text-[color:var(--muted)]">{meta}</div>
            <span className="w-1 h-1 bg-[color:green] rounded-full"></span>
            <span className="text-xs text-[color:var(--muted)]">la rédaction</span>
          </div>
                  ) : null}
      </div>
    </Link>
  );
}


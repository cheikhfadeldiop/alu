import * as React from "react";
import { Link } from "../../i18n/navigation";
import { LiveBadge } from "./LiveBadge";
import { SITE_CONFIG } from "@/constants/site-config";
import { SafeImage } from "./SafeImage";

export type MediaCardProps = {
  href: string;
  title: string;
  imageSrc: string;
  meta?: string;
  live?: boolean;
  showPlayIcon?: boolean;
  showAudioIcon?: boolean;
  aspect?: "16/9" | "4/3" | "1/1" | "469/246";
  channelLogo?: string;
  target?: boolean;
  author?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
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
      className="absolute left-1/2 top-1/2 flex h-10 w-10 sm:h-14 sm:w-14 -translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-110"
      aria-hidden
    >
      <SafeImage
        src="/assets/placeholders/play_overlay.png"
        alt="Play"
        width={40}
        height={40}
        className="h-8 w-8 sm:h-12 sm:w-12"
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
  showAudioIcon = false,
  aspect = "16/9",
  channelLogo,
  target = true,
  author,
  onClick,
  className,
}: MediaCardProps) {
  const content = (
    <div className="group block overflow-hidden bg-background/30 backdrop-blur-xl hover:scale-105 transition-transform hover:z-10 cursor-pointer">
      <div className={["relative w-full overflow-hidden", aspectClass(aspect)].join(" ") + " " + className}>
        <SafeImage
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
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
        {showAudioIcon ? (
          <div className="absolute bottom-2 left-2 z-20  p-1.5 flex items-center justify-center">
            <SafeImage
              src="/assets/radio composant/audio.png"
              alt="Audio"
              width={50}
              height={50}
              className="object-contain"
            />
          </div>
        ) : null}

        {channelLogo && (
          <div className="absolute bottom-2 right-2 z-20 w-14 h-12 rounded-sm bg-background/30 backdrop-blur-md p-0.5 shadow-md overflow-hidden">
            <SafeImage
              src={channelLogo}
              alt="Channel"
              fill
              className="object-contain p-1"
            />
          </div>
        )}
      </div>

      <div className="space-y-1 p-2.5 sm:p-4 justify-between">
        <div className="line-clamp-2 text-[11px] sm:text-sm font-semibold sm:leading-6 text-foreground ">
          {title}
        </div>
        {meta ? (
          <div className="flex items-center justify-between w-full">
            <div className="text-[11px] sm:text-xs text-muted">{meta}</div>
            {author && (
              <div className="flex items-center gap-1.5 sm:gap-2 hidden sm:flex">
                <span className="w-1 h-1 bg-success rounded-full"></span>
                <span className="text-[10px] sm:text-xs text-muted">
                  {author}
                </span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return (
    <Link href={href} target={target ? "_blank" : "_self"} rel="noopener noreferrer">
      {content}
    </Link>
  );
}

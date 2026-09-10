import { videoEmbed } from "@/lib/video";
import { cn } from "@/lib/utils";

/**
 * Renders whatever a lesson or course has: an uploaded file, a YouTube link,
 * or a direct video URL. Returns null when there is nothing to play, so the
 * caller can show its own placeholder.
 */
export function VideoFrame({
  filePath,
  url,
  title,
  className,
  autoPlay = false,
  playerKey,
}: {
  filePath?: string | null;
  url?: string | null;
  title: string;
  className?: string;
  autoPlay?: boolean;
  playerKey?: string;
}) {
  const frame = cn("aspect-video w-full", className);

  if (filePath) {
    return (
      <video
        key={playerKey}
        className={frame}
        controls
        playsInline
        preload="metadata"
        autoPlay={autoPlay}
        src={filePath}
        aria-label={title}
      />
    );
  }

  const embed = videoEmbed(url);
  if (!embed) return null;

  if (embed.kind === "youtube") {
    return (
      <iframe
        key={playerKey}
        className={frame}
        src={embed.src}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return (
    <video
      key={playerKey}
      className={frame}
      controls
      playsInline
      preload="metadata"
      autoPlay={autoPlay}
      src={embed.src}
      aria-label={title}
    />
  );
}

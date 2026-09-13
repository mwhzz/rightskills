"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

type YtPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  isMuted: () => boolean;
  mute: () => void;
  unMute: () => void;
  getIframe?: () => HTMLIFrameElement;
  destroy: () => void;
};

type YtNamespace = {
  Player: new (
    element: HTMLElement | string,
    options: Record<string, unknown>
  ) => YtPlayer;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
};

declare global {
  interface Window {
    YT?: YtNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const PLAYING = 1;
const PAUSED = 2;
const ENDED = 0;

let apiPromise: Promise<YtNamespace> | null = null;

function loadYoutubeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("no window"));
  }
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    if (!document.querySelector("script[data-rs-youtube-api]")) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.dataset.rsYoutubeApi = "1";
      document.head.appendChild(script);
    }
    if (window.YT?.Player) resolve(window.YT);
  });

  return apiPromise;
}

function formatTime(total: number) {
  if (!Number.isFinite(total) || total < 0) return "0:00";
  const seconds = Math.floor(total);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function blockEvent(event: { preventDefault: () => void; stopPropagation: () => void }) {
  event.preventDefault();
  event.stopPropagation();
}

export function ProtectedYouTube({
  videoId,
  lessonId,
  title,
  className,
  playerKey,
}: {
  videoId?: string;
  lessonId?: string;
  title: string;
  className?: string;
  playerKey?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const dragging = useRef(false);
  const [resolvedId, setResolvedId] = useState(videoId ?? "");
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (videoId) {
      setResolvedId(videoId);
      setMissing(false);
      return;
    }
    if (!lessonId) {
      setMissing(true);
      return;
    }
    let cancelled = false;
    fetch(`/api/lessons/${encodeURIComponent(lessonId)}/youtube`, {
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { id?: string } | null) => {
        if (cancelled) return;
        const id = typeof data?.id === "string" ? data.id : "";
        setResolvedId(id);
        setMissing(!id);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId, videoId]);

  useEffect(() => {
    const box = boxRef.current;
    if (!resolvedId || !box) return;
    let cancelled = false;
    let player: YtPlayer | null = null;
    const host = document.createElement("div");
    host.className = "size-full";
    box.replaceChildren(host);

    loadYoutubeApi().then((YT) => {
      if (cancelled || !host.isConnected) return;
      player = new YT.Player(host, {
        width: "100%",
        height: "100%",
        videoId: resolvedId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          playsinline: 1,
          origin: window.location.origin,
          widget_referrer: window.location.origin,
        },
        events: {
          onReady: () => {
            if (cancelled) return;
            const iframe = player?.getIframe?.();
            if (iframe) {
              iframe.tabIndex = -1;
              iframe.style.pointerEvents = "none";
              iframe.setAttribute("allow", "encrypted-media; autoplay");
              iframe.removeAttribute("allowfullscreen");
            }
            playerRef.current = player;
            setDuration(player?.getDuration?.() || 0);
            setMuted(Boolean(player?.isMuted?.()));
            setReady(true);
          },
          onStateChange: (event: { data: number }) => {
            if (cancelled) return;
            setPlaying(event.data === PLAYING);
            setEnded(event.data === ENDED);
            if (event.data === PAUSED || event.data === PLAYING || event.data === ENDED) {
              setCurrent(player?.getCurrentTime?.() || 0);
              setDuration(player?.getDuration?.() || 0);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      setReady(false);
      setPlaying(false);
      playerRef.current = null;
      player?.destroy();
      box.replaceChildren();
    };
  }, [resolvedId, playerKey]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (dragging.current) return;
      const player = playerRef.current;
      if (!player) return;
      setCurrent(player.getCurrentTime?.() || 0);
      setDuration(player.getDuration?.() || 0);
    }, 250);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    function onFullscreen() {
      setFullscreen(document.fullscreenElement === wrapRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (ended) {
      player.seekTo(0, true);
      player.playVideo();
      return;
    }
    if (player.getPlayerState() === PLAYING) player.pauseVideo();
    else player.playVideo();
  }, [ended]);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isMuted()) {
      player.unMute();
      setMuted(false);
    } else {
      player.mute();
      setMuted(true);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const node = wrapRef.current;
    if (!node) return;
    if (document.fullscreenElement === node) {
      void document.exitFullscreen();
    } else {
      void node.requestFullscreen();
    }
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative overflow-hidden bg-zinc-950 select-none",
        className
      )}
      onContextMenu={blockEvent}
      onDragStart={blockEvent}
    >
      <div
        ref={boxRef}
        className="absolute inset-0 [&_iframe]:pointer-events-none [&_iframe]:size-full"
      />

      <div
        className="absolute inset-0 z-10"
        onContextMenu={blockEvent}
        onClick={ready ? togglePlay : undefined}
        aria-hidden="true"
      />

      {!ready && !missing ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center text-sm text-white/60">
          Loading player
        </div>
      ) : null}

      {missing ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center text-sm text-white/60">
          Video unavailable
        </div>
      ) : null}

      {ready && (!playing || ended) ? (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 z-20 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm"
          aria-label={ended ? "Replay" : "Play"}
        >
          <Play className="size-7 fill-current" />
        </button>
      ) : null}

      {ready ? (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-3 pt-10 pb-3">
          <input
            type="range"
            min={0}
            max={Math.max(duration, 1)}
            step={0.1}
            value={Math.min(current, duration || 0)}
            aria-label="Seek"
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-white"
            onPointerDown={() => {
              dragging.current = true;
            }}
            onPointerUp={() => {
              dragging.current = false;
            }}
            onChange={(event) => {
              const next = Number(event.target.value);
              setCurrent(next);
              playerRef.current?.seekTo(next, true);
            }}
          />
          <div className="mt-2 flex items-center gap-2 text-white">
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex size-8 items-center justify-center rounded-full hover:bg-white/15"
              aria-label={playing && !ended ? "Pause" : "Play"}
            >
              {playing && !ended ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4 fill-current" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="inline-flex size-8 items-center justify-center rounded-full hover:bg-white/15"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <span className="ml-1 text-xs tabular-nums text-white/80">
              {formatTime(current)} / {formatTime(duration)}
            </span>
            <span className="sr-only">{title}</span>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="ml-auto inline-flex size-8 items-center justify-center rounded-full hover:bg-white/15"
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? (
                <Minimize className="size-4" />
              ) : (
                <Maximize className="size-4" />
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

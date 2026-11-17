import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Pause,
  Play,
  X,
} from "lucide-react";
import { Cover } from "./components";
import { RetryImage } from "./retry-image";
import { useSession } from "./state";

export function GameGallery({ game }) {
  const { nsfw } = useSession();
  const images = [
    ...new Set([game.cover_image_url, ...(game.gallery_images || [])]),
  ];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const viewer = useRef(null);
  const selected = images[index] || images[0];
  const restricted = game.is_adult && !nsfw;
  const move = (step) =>
    setIndex((i) => (i + step + images.length) % images.length);
  useEffect(() => {
    if (
      images.length < 2 ||
      paused ||
      interacting ||
      viewerOpen ||
      restricted ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible")
        setIndex((i) => (i + 1) % images.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [images.length, paused, interacting, viewerOpen, restricted, index]);
  return (
    <section
      className="game-gallery"
      aria-label="Oyun görselleri"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setInteracting(false);
      }}
    >
      <div className="gallery-stage">
        <Cover
          key={selected}
          game={{ ...game, cover_image_url: selected }}
          detail
        />
        {!restricted && (
          <button
            className="gallery-expand"
            onClick={() => {
              viewer.current.showModal();
              setViewerOpen(true);
            }}
          >
            <Expand size={15} /> Tam boyut
          </button>
        )}
        {images.length > 1 && !restricted && (
          <div className="gallery-arrows">
            <button
              className="gallery-arrow"
              aria-label="Önceki görsel"
              onClick={() => move(-1)}
            >
              <ChevronLeft />
            </button>
            <button
              className="gallery-arrow"
              aria-label="Sonraki görsel"
              onClick={() => move(1)}
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
      <div className="gallery-meta">
        <span>
          {index + 1} / {images.length} görsel
        </span>
        {images.length > 1 && (
          <button
            className="gallery-play"
            onClick={() => setPaused((v) => !v)}
            aria-label={paused ? "Slaytı oynat" : "Slaytı duraklat"}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
            <span>{paused ? "Oynat" : "Duraklat"}</span>
          </button>
        )}
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs" aria-label="Görsel seç">
          {images.map((src, i) => (
            <button
              key={src}
              aria-label={`${i + 1}. görseli göster`}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
              className={restricted ? "sensitive-thumb" : ""}
            >
              <RetryImage
                key={src}
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}
      <dialog
        ref={viewer}
        onClose={() => setViewerOpen(false)}
        className="image-viewer"
        aria-label={`${game.title} görsel galerisi`}
        onClick={(e) => {
          if (e.target === e.currentTarget) viewer.current.close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move(1);
          if (e.key === "ArrowLeft") move(-1);
        }}
      >
        <div className="viewer-toolbar">
          <strong>
            {game.title} · {index + 1}/{images.length}
          </strong>
          <button
            className="icon"
            aria-label="Galeriyi kapat"
            onClick={() => viewer.current.close()}
          >
            <X />
          </button>
        </div>
        {!restricted && (
          <img
            src={selected}
            alt={`${game.title} · ${index + 1}. görsel`}
            referrerPolicy="no-referrer"
          />
        )}
        {images.length > 1 && (
          <div className="viewer-controls">
            <button className="secondary" onClick={() => move(-1)}>
              <ChevronLeft size={16} /> Önceki
            </button>
            <button className="secondary" onClick={() => move(1)}>
              Sonraki <ChevronRight size={16} />
            </button>
          </div>
        )}
      </dialog>
    </section>
  );
}

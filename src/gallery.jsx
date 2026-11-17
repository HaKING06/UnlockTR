import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { Cover } from "./components";
import { useSession } from "./state";

export function GameGallery({ game }) {
  const { nsfw } = useSession();
  const images = [
    ...new Set([game.cover_image_url, ...(game.gallery_images || [])]),
  ];
  const [index, setIndex] = useState(0);
  const [sizes, setSizes] = useState({});
  const viewer = useRef(null);
  const selected = images[index] || images[0];
  const restricted = game.is_adult && !nsfw;
  const move = (step) =>
    setIndex((i) => (i + step + images.length) % images.length);
  return (
    <section className="game-gallery" aria-label="Oyun görselleri">
      <div
        className={
          "gallery-stage " +
          (sizes[selected]?.width < 960 ? "compact-media" : "")
        }
      >
        <Cover
          key={selected}
          game={{ ...game, cover_image_url: selected }}
          detail
          onSize={(size) =>
            setSizes((old) =>
              old[selected]?.width === size.width
                ? old
                : { ...old, [selected]: size },
            )
          }
        />
        {!restricted && (
          <button
            className="gallery-expand"
            onClick={() => viewer.current.showModal()}
          >
            <Expand size={15} /> Tam boyut
          </button>
        )}
      </div>
      <div className="gallery-meta">
        <span>
          {index + 1} / {images.length} görsel
        </span>
        <span>Orijinal oran · kırpılmadan</span>
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
              <img
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

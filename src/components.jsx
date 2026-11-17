import React, { useState } from "react";
import { Gamepad2, Eye, EyeOff } from "lucide-react";
import { useSession } from "./state";
export function Cover({ game, detail = false, onSize }) {
  const { nsfw: reveal, showNsfw } = useSession();
  const onReveal = () => showNsfw(true);
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={
        "cover " +
        (detail ? "detail-cover " : "") +
        (game.is_adult && !reveal ? "restricted" : "")
      }
    >
      {!failed ? (
        <img
          src={game.cover_image_url}
          alt={game.is_adult ? "Yetişkin içerik kapağı" : game.title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={(e) =>
            onSize?.({
              width: e.currentTarget.naturalWidth,
              height: e.currentTarget.naturalHeight,
            })
          }
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="cover-fallback">
          <img
            src="/brand/mark.webp?v=0.9.0"
            alt="UTR"
            width="110"
            height="55"
          />
          <span>UTRZONE</span>
        </div>
      )}
      {game.is_adult && !reveal && (
        <div className="adult">
          <div className="adult-symbol">
            <EyeOff size={22} />
          </div>
          <strong>Yetişkin içerik</strong>
          <p>Bu oyun 18+ içerik barındırır.</p>
          <button onClick={onReveal}>
            <Eye size={13} />
            18 yaşından büyüğüm · Göster
          </button>
          <span className="nsfw-mark">18+ / NSFW</span>
        </div>
      )}
    </div>
  );
}

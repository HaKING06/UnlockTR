import React, { useState } from "react";
import { Gamepad2, Eye, EyeOff } from "lucide-react";
import { useSession } from "./state";
export function Cover({ game }) {
  const { nsfw: reveal, showNsfw } = useSession();
  const onReveal = () => showNsfw(true);
  const [failed, setFailed] = useState(false);
  return (
    <div className={"cover " + (game.is_adult && !reveal ? "restricted" : "")}>
      {!failed ? (
        <img
          src={game.cover_image_url}
          alt={game.is_adult ? "Yetişkin içerik kapağı" : game.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="cover-fallback">
          <Gamepad2 size={45} />
          <span>UNLOCKTR</span>
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

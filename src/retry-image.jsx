import React, { useEffect, useState } from "react";

export function RetryImage({ src, onError, ...props }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!failed || attempt >= 2) return;
    const timer = setTimeout(
      () => {
        setAttempt((v) => v + 1);
        setFailed(false);
      },
      2000 * (attempt + 1),
    );
    return () => clearTimeout(timer);
  }, [failed, attempt]);
  const url = new URL(src, window.location.origin);
  if (attempt) url.searchParams.set("utr_retry", String(attempt));
  return (
    <img
      {...props}
      src={failed && attempt >= 2 ? "/brand/mark.webp" : url.href}
      onError={() => {
        if (attempt >= 2) onError?.();
        setFailed(true);
      }}
    />
  );
}

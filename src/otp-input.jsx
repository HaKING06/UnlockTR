import React, { useRef, useState } from "react";
export function CodeInput({ name = "code", label = "Doğrulama kodu" }) {
  const [digits, setDigits] = useState(Array(6).fill(""));
  const refs = useRef([]);
  function insert(raw, index) {
    const clean = raw.replace(/\D/g, "");
    const next = [...digits];
    if (!clean) {
      next[index] = "";
      setDigits(next);
      return;
    }
    for (let i = 0; i < clean.length && index + i < 6; i++)
      next[index + i] = clean[i];
    setDigits(next);
    refs.current[Math.min(index + clean.length, 5)]?.focus();
  }
  return (
    <div className="field code-field">
      <span>{label}</span>
      <div className="code-boxes" role="group" aria-label={label}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(e) => (refs.current[i] = e)}
            aria-label={label + " " + (i + 1) + ". rakam"}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={6}
            pattern="[0-9]"
            required
            value={d}
            onFocus={(e) => e.target.select()}
            onChange={(e) => insert(e.target.value, i)}
            onPaste={(e) => {
              e.preventDefault();
              insert(e.clipboardData.getData("text"), i);
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !d && i > 0) {
                e.preventDefault();
                refs.current[i - 1]?.focus();
              }
              if (e.key === "ArrowLeft" && i > 0) {
                e.preventDefault();
                refs.current[i - 1]?.focus();
              }
              if (e.key === "ArrowRight" && i < 5) {
                e.preventDefault();
                refs.current[i + 1]?.focus();
              }
            }}
          />
        ))}
      </div>
      <input type="hidden" name={name} value={digits.join("")} />
      <small>
        6 haneli kod · Yapıştırabilir veya otomatik doldurabilirsin.
      </small>
    </div>
  );
}

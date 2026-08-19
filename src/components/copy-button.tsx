"use client";

import { useEffect, useRef, useState } from "react";

export function CopyButton({
  label = "Copy",
  value,
}: {
  readonly label?: string;
  readonly value: string;
}) {
  const [status, setStatus] = useState<"copied" | "error" | "idle">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2_000);
  }

  const copied = status === "copied";

  return (
    <button
      aria-label={copied ? `${label} copied` : status === "error" ? `${label} failed` : label}
      className={`copy-button${copied ? " copy-button--copied" : ""}`}
      onClick={copy}
      type="button"
    >
      <span aria-hidden="true">{copied ? "✓" : status === "error" ? "!" : "⧉"}</span>
      {copied ? "Copied" : status === "error" ? "Try again" : label}
    </button>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

export function CopyButton({
  label = "Copy",
  value,
}: {
  readonly label?: string;
  readonly value: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2_000);
  }

  return (
    <button
      aria-label={copied ? `${label} copied` : label}
      className={`copy-button${copied ? " copy-button--copied" : ""}`}
      onClick={copy}
      type="button"
    >
      <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
      {copied ? "Copied" : label}
    </button>
  );
}

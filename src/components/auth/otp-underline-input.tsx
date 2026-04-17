"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

type Props = {
  value: string;
  onChange: (digits: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

function digitsArray(value: string): string[] {
  const d = value.replace(/\D/g, "").slice(0, LENGTH);
  return Array.from({ length: LENGTH }, (_, i) => d[i] ?? "");
}

export function OtpUnderlineInput({ value, onChange, disabled, autoFocus }: Props) {
  const baseId = useId();
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const cells = digitsArray(value);

  const focusAt = useCallback((i: number) => {
    const el = refs.current[Math.max(0, Math.min(LENGTH - 1, i))];
    el?.focus();
    el?.select();
  }, []);

  useEffect(() => {
    if (autoFocus) focusAt(0);
  }, [autoFocus, focusAt]);

  const commit = useCallback(
    (next: string[]) => {
      onChange(next.join("").replace(/\D/g, "").slice(0, LENGTH));
    },
    [onChange],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
      if (!pasted) return;
      onChange(pasted);
      focusAt(Math.min(pasted.length, LENGTH - 1));
    },
    [focusAt, onChange],
  );

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (cells[index]) return;
      e.preventDefault();
      const next = [...cells];
      if (index > 0) {
        next[index - 1] = "";
        commit(next);
        focusAt(index - 1);
      }
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    }
    if (e.key === "ArrowRight" && index < LENGTH - 1) {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  return (
    <div role="group" aria-label="One-time password" className="flex justify-center gap-2 sm:gap-3">
      {cells.map((digit, index) => (
        <input
          key={`${baseId}-${index}`}
          ref={(el) => {
            refs.current[index] = el;
          }}
          id={`${baseId}-${index}`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={digit}
          aria-label={`Digit ${index + 1} of ${LENGTH}`}
          className={cn(
            "h-12 w-9 border-0 border-b-2 bg-transparent text-center text-lg font-medium tabular-nums",
            "rounded-none shadow-none outline-none transition-colors",
            "border-muted-foreground/35 focus-visible:border-foreground",
            digit ? "border-foreground/70" : "border-muted-foreground/35",
            disabled && "cursor-not-allowed opacity-50",
          )}
          onChange={(e) => {
            const ch = e.target.value.replace(/\D/g, "").slice(-1);
            const next = [...cells];
            next[index] = ch;
            commit(next);
            if (ch && index < LENGTH - 1) focusAt(index + 1);
          }}
          onPaste={handlePaste}
          onKeyDown={(e) => onKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}

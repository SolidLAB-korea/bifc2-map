import { useRef } from "react";

const DOUBLE_TAP_DELAY_MS = 450;

function isTouchLikeDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

export function useMobileDoubleTap() {
  const lastTapRef = useRef({ key: "", time: 0 });

  return (key: string, action: () => void, clickDetail = 1) => {
    if (!isTouchLikeDevice() || clickDetail === 0) {
      action();
      return;
    }

    const now = Date.now();
    const lastTap = lastTapRef.current;

    if (lastTap.key === key && now - lastTap.time <= DOUBLE_TAP_DELAY_MS) {
      lastTapRef.current = { key: "", time: 0 };
      action();
      return;
    }

    lastTapRef.current = { key, time: now };
  };
}

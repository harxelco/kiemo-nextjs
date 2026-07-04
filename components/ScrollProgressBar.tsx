"use client";

import { useEffect, useRef } from "react";

export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // #scroll-progress itself is rendered once, up front, in layout.tsx
    // (it needs to be the very first element for stacking/paint order,
    // same as the legacy markup) — this component just finds it and
    // drives its width, so there's only ever one instance in the DOM.
    const bar = document.getElementById("scroll-progress");
    function onScroll() {
      if (!bar) return;
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + "%";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div ref={barRef} style={{ display: "none" }} aria-hidden="true" />;
}

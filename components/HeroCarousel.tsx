"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface HeroCarouselProps {
  images: readonly string[];
  side: "left" | "right";
  className?: string;
}

const ROTATE_INTERVAL_MS = 3200;

export function HeroCarousel({ images, side, className }: HeroCarouselProps) {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function prefersReducedMotion() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  useEffect(() => {
    if (prefersReducedMotion() || images.length === 0) return;
    intervalRef.current = setInterval(() => {
      setActive((a) => (a + 1) % images.length);
    }, ROTATE_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [images.length]);

  function pause() {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }
  function resume() {
    if (prefersReducedMotion() || images.length === 0) return;
    intervalRef.current = setInterval(() => {
      setActive((a) => (a + 1) % images.length);
    }, ROTATE_INTERVAL_MS);
  }

  const n = images.length;
  const dir = side === "left" ? 1 : -1;

  return (
    <div
      className={`hero-carousel${className ? " " + className : ""}`}
      aria-hidden="true"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="carousel-stage">
        {images.map((src, i) => {
          const rel = (i - active + n) % n;
          let tx = 0,
            ty = 0,
            tz = 0,
            rot = 0,
            scale = 1,
            op = 1,
            z = n;
          if (rel === 1) {
            tx = dir * 60; ty = 22; tz = -90; rot = dir * -10; scale = 0.93; op = 0.82; z = n - 1;
          } else if (rel === 2) {
            tx = dir * 105; ty = 44; tz = -180; rot = dir * -16; scale = 0.86; op = 0.5; z = n - 2;
          } else if (rel >= 3) {
            tx = dir * 135; ty = 64; tz = -260; rot = dir * -22; scale = 0.78; op = 0.22; z = 0;
          }
          return (
            <div
              key={src}
              className={`carousel-slide${rel === 0 ? " is-active" : ""}`}
              style={{
                transform: `translate3d(${tx}px,${ty}px,${tz}px) rotateY(${rot}deg) scale(${scale})`,
                opacity: op,
                zIndex: z,
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 1100px) 45vw, 380px"
                style={{ objectFit: "cover" }}
                priority={i === 0}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

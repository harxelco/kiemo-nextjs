"use client";

import { useEffect, useRef, useState } from "react";
import { HeroCarousel } from "./HeroCarousel";
import { HERO_CAROUSEL_IMAGES } from "@/data/hero-carousel-images";

const ANIM_DELAYS = [100, 260, 420, 520, 680];

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [animIn, setAnimIn] = useState<boolean[]>([false, false, false, false, false]);

  // Staggered hero text entrance — same delays as the legacy initHero().
  useEffect(() => {
    const timers = ANIM_DELAYS.map((delay, i) =>
      setTimeout(() => {
        setAnimIn((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Mouse-parallax on the two flanking carousels (desktop only — the CSS
  // transform that reads --px/--py is itself scoped off on the mobile row).
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onMouseMove(e: MouseEvent) {
      if (!hero) return;
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty("--px", px.toFixed(3));
      hero.style.setProperty("--py", py.toFixed(3));
    }
    hero.addEventListener("mousemove", onMouseMove);
    return () => hero.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <section id="hero" aria-label="Hero" ref={heroRef}>
      <div className="hero-radial-bg" aria-hidden="true" />

      <HeroCarousel images={HERO_CAROUSEL_IMAGES.left} side="left" />

      <div className="hero-carousels-row">
        <HeroCarousel images={HERO_CAROUSEL_IMAGES.left} side="left" />
        <HeroCarousel images={HERO_CAROUSEL_IMAGES.right} side="right" />
      </div>

      <div className="hero-content">
        <p className={`hero-eyebrow${animIn[0] ? " anim-in" : ""}`}>
          <span className="eyebrow-pip" />
          NAIROBI &nbsp;·&nbsp; KIMATHI STREET &nbsp;·&nbsp; EST. 2018
        </p>
        <h1 className="hero-headline">
          <span className={`hero-wordmark${animIn[1] ? " anim-in" : ""}`}>
            KIEMO<span className="wm-dot">.</span>
          </span>
        </h1>
        <div className={`hero-rule${animIn[2] ? " anim-in" : ""}`} />
        <p className={`hero-sub${animIn[3] ? " anim-in" : ""}`}>
          Premium menswear for the modern Nairobi gentleman.
          <br />
          100+ curated pieces. Easy checkout. Same-day delivery.
        </p>
        <div className={`hero-ctas${animIn[4] ? " anim-in" : ""}`}>
          <a href="#shop" className="btn-primary btn-large">
            Shop Collections
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a href="#contact" className="btn-wa btn-large">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contact Us
          </a>
        </div>
      </div>

      <HeroCarousel images={HERO_CAROUSEL_IMAGES.right} side="right" />

      <div className="hero-scroll-indicator" aria-hidden="true">
        <div className="scroll-line" />
        <span className="scroll-label">Scroll</span>
      </div>
    </section>
  );
}

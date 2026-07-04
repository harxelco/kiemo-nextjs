"use client";

import { useEffect } from "react";

export function ScrollRevealInit() {
  useEffect(() => {
    const t = setTimeout(() => {
      const revealEls = document.querySelectorAll("[data-reveal]");
      const io1 = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io1.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach((el) => io1.observe(el));

      const cardEls = document.querySelectorAll(".product-card");
      const io2 = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io2.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
      );
      cardEls.forEach((el) => io2.observe(el));
    }, 80);

    return () => clearTimeout(t);
  }, []);

  return null;
}

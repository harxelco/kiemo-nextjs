"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/hooks/CartContext";
import { SITE_CONFIG, whatsappContactUrl } from "@/lib/site-config";

const NAV_LINKS = [
  { href: "#hero", label: "Home" },
  { href: "#collections", label: "Collections" },
  { href: "#new-arrivals", label: "New Arrivals" },
  { href: "#offers", label: "Offers" },
  { href: "#shop", label: "Shop" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const { cartCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("hero");
  const navRef = useRef<HTMLElement>(null);

  // Nav "scrolled" state
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active link on scroll — same IntersectionObserver approach as the
  // legacy initNav(), just re-homed into React state.
  useEffect(() => {
    const sections = document.querySelectorAll("section[id], footer[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll while mobile menu is open; close on Escape.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-label="Navigation menu"
        aria-hidden={!menuOpen}
        className={menuOpen ? "open" : ""}
      >
        <button
          id="mobile-close"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="mobile-menu-inner">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="mobile-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="mobile-menu-footer">
          <a
            href={whatsappContactUrl("")}
            target="_blank"
            rel="noopener"
            className="mobile-wa-link"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp: {SITE_CONFIG.whatsappDisplay}
          </a>
        </div>
      </div>

      {/* Navigation */}
      <nav
        id="nav"
        ref={navRef}
        role="navigation"
        aria-label="Main navigation"
        className={scrolled ? "scrolled" : ""}
      >
        <a href="#hero" className="nav-brand" aria-label="Kiemo Mens Wear — Home">
          <Image
            src="/assets/logo-gold-transparent.png"
            alt="Kiemo Men's Wear"
            width={244}
            height={91}
            priority
          />
        </a>
        <ul className="nav-links" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`nav-link${activeId === link.href.slice(1) ? " active" : ""}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <button
            id="cart-btn"
            aria-label={`Open cart (${cartCount} items)`}
            onClick={openCart}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span id="cart-count" className={cartCount > 0 ? "visible" : ""} aria-live="polite">
              {cartCount}
            </span>
          </button>
          <button
            id="hamburger"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={menuOpen ? "open" : ""}
            onClick={() => setMenuOpen(true)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
    </>
  );
}

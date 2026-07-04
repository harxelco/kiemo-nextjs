import Image from "next/image";
import { SITE_CONFIG } from "@/lib/site-config";

export function Footer() {
  return (
    <footer id="footer" aria-label="Site footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Image
            src="/assets/logo-gold-transparent.png"
            alt="Kiemo Men's Wear"
            width={244}
            height={91}
            className="footer-logo-img"
          />
          <p className="footer-tagline">{SITE_CONFIG.tagline}</p>
          <div className="footer-socials">
            <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener" className="footer-social" aria-label="Kiemo on Instagram">
              Instagram
            </a>
            <a href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`} target="_blank" rel="noopener" className="footer-social" aria-label="Kiemo on WhatsApp">
              WhatsApp
            </a>
            <a href={SITE_CONFIG.tiktokUrl} target="_blank" rel="noopener" className="footer-social" aria-label="Kiemo on TikTok">
              TikTok
            </a>
          </div>
        </div>
        <div className="footer-nav-group">
          <div className="footer-nav-col">
            <div className="footer-nav-title">Shop</div>
            <nav aria-label="Shop navigation">
              <a href="#new-arrivals">New Arrivals</a>
              <a href="#offers">Special Offers</a>
              <a href="#shop">All Products</a>
              <a href="#collections">Collections</a>
            </nav>
          </div>
          <div className="footer-nav-col">
            <div className="footer-nav-title">About</div>
            <nav aria-label="About navigation">
              <a href="#about">Our Story</a>
              <a href="#testimonials">Reviews</a>
              <a href="#contact">Visit Us</a>
              <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener">Instagram</a>
            </nav>
          </div>
          <div className="footer-nav-col">
            <div className="footer-nav-title">Order</div>
            <nav aria-label="Order navigation">
              {/* Was "WhatsApp Order" -> wa.me link (Part 3: ordering moves
                  off WhatsApp entirely into the on-site checkout flow). */}
              <a href="#shop">Checkout</a>
              <a href="#shop">Browse Products</a>
              <a href="#contact">Find the Store</a>
            </nav>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© 2026 {SITE_CONFIG.name} · {SITE_CONFIG.address}</span>
        <span className="footer-made">Crafted with care in Nairobi</span>
      </div>
    </footer>
  );
}

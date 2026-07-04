import Image from "next/image";
import { SITE_CONFIG, whatsappContactUrl } from "@/lib/site-config";

const STORE_IMG =
  "https://res.cloudinary.com/dtsixdjix/image/upload/v1782896960/Kiemo_website_footer_section_ziabid.png";

export function ContactSection() {
  return (
    <section id="contact" aria-label="Contact">
      <div className="contact-grid">
        <div className="contact-left">
          <span className="section-label" data-reveal>Visit Us</span>
          <h2 className="contact-title" data-reveal>
            Visit the<br />Flagship Store
          </h2>
          <div className="contact-items" data-reveal>
            <div className="contact-item">
              <div className="contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <div className="ci-label">Location</div>
                <div className="ci-value">{SITE_CONFIG.address}</div>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .82h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.69a16 16 0 006.29 6.29l1.23-1.15a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div>
                <div className="ci-label">WhatsApp</div>
                <div className="ci-value">
                  <a href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`} target="_blank" rel="noopener">
                    {SITE_CONFIG.whatsappDisplay}
                  </a>
                </div>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <div>
                <div className="ci-label">Instagram</div>
                <div className="ci-value">
                  <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener">
                    {SITE_CONFIG.instagramHandle}
                  </a>
                </div>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M16.5 2h-2.7v13.7a3.1 3.1 0 11-2.2-2.97V9.95a5.8 5.8 0 104.9 5.73V8.2a6.7 6.7 0 003.9 1.25V6.75A4 4 0 0116.5 2z" />
                </svg>
              </div>
              <div>
                <div className="ci-label">TikTok</div>
                <div className="ci-value">
                  <a href={SITE_CONFIG.tiktokUrl} target="_blank" rel="noopener">
                    {SITE_CONFIG.tiktokHandle}
                  </a>
                </div>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <div className="ci-label">Opening Hours</div>
                <div className="ci-value">{SITE_CONFIG.hours}</div>
              </div>
            </div>
          </div>
          <div className="contact-ctas" data-reveal>
            <a
              href={whatsappContactUrl("Hello Kiemo! I'd like to know more about your collection.")}
              target="_blank"
              rel="noopener"
              className="btn-primary"
            >
              Chat on WhatsApp
            </a>
            <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener" className="btn-secondary">
              Follow on Instagram
            </a>
          </div>
        </div>
        <div className="contact-right">
          <Image
            src={STORE_IMG}
            alt="Kiemo Flagship — Kimathi Street Nairobi"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

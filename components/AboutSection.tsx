import Image from "next/image";
import { whatsappContactUrl } from "@/lib/site-config";

const STORE_IMG =
  "https://res.cloudinary.com/dtsixdjix/image/upload/v1782896960/Kiemo_website_footer_section_ziabid.png";

export function AboutSection() {
  return (
    <section id="about" className="section-wrap" aria-label="About Kiemo">
      <div className="about-grid">
        <div className="about-text">
          <span className="section-label" data-reveal>Our Story</span>
          <h2 className="about-headline" data-reveal>
            Born in Nairobi.<br />Worn <em>Worldwide.</em>
          </h2>
          <p className="about-story" data-reveal>
            Founded with a single belief: that the African gentleman deserves
            world-class fashion without travelling the world to find it. From
            our flagship at Lyric House on Kimathi Street, we curate and
            create menswear that speaks to ambition, sophistication, and
            self-expression.
          </p>
          <div className="about-stats" data-reveal>
            <div className="about-stat-item">
              <span className="astat-n">2018</span>
              <span className="astat-l">Est. Year</span>
            </div>
            <div className="about-stat-item">
              <span className="astat-n">15.6K</span>
              <span className="astat-l">Followers</span>
            </div>
            <div className="about-stat-item">
              <span className="astat-n">100%</span>
              <span className="astat-l">Premium</span>
            </div>
          </div>
          <a
            href={whatsappContactUrl("Hello Kiemo! I'd like to visit the flagship store.")}
            className="btn-primary"
            data-reveal
            target="_blank"
            rel="noopener"
          >
            Visit the Flagship Store →
          </a>
        </div>
        <div className="about-img-wrap" data-reveal>
          <Image
            src={STORE_IMG}
            alt="Kiemo Nairobi Flagship Store"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
        </div>
      </div>
      <div className="values-row">
        <div className="value-item" data-reveal>
          <div className="value-line" />
          <div className="value-title">Quality</div>
          <p className="value-desc">
            Every piece selected for the integrity of its fabric, the
            precision of its cut, and the longevity of its wear.
          </p>
        </div>
        <div className="value-item" data-reveal>
          <div className="value-line" />
          <div className="value-title">Heritage</div>
          <p className="value-desc">
            Rooted in Nairobi, inspired by the world. A brand that wears its
            provenance with unapologetic confidence.
          </p>
        </div>
        <div className="value-item" data-reveal>
          <div className="value-line" />
          <div className="value-title">Style</div>
          <p className="value-desc">
            Clothing that speaks before you do. A wardrobe built for
            ambition, occasion, and the gentleman who earns both.
          </p>
        </div>
      </div>
    </section>
  );
}

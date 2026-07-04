import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { CollectionsSection } from "@/components/CollectionsSection";
import { NewArrivalsSection } from "@/components/NewArrivalsSection";
import { OffersSection } from "@/components/OffersSection";
import { ShopSection } from "@/components/ShopSection";
import { AboutSection } from "@/components/AboutSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactSection } from "@/components/ContactSection";
import { ScrollRevealInit } from "@/components/ScrollRevealInit";
import { getApprovedReviews } from "@/lib/get-approved-reviews";

export default async function HomePage() {
  const liveReviews = await getApprovedReviews();

  return (
    <main>
      <Hero />
      <Marquee />
      <CollectionsSection />
      <NewArrivalsSection />
      <OffersSection />
      <ShopSection />
      <AboutSection />
      <TestimonialsSection liveReviews={liveReviews} />
      <ContactSection />
      <ScrollRevealInit />
    </main>
  );
}

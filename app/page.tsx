import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/home/Hero";
import { Positioning } from "@/components/home/Positioning";
import { WorkSection } from "@/components/home/WorkSection";
import { ProofStrip } from "@/components/home/ProofStrip";
import { Practice } from "@/components/home/Practice";
import { About } from "@/components/home/About";
import { Contact } from "@/components/home/Contact";

// First paint is prerendered SSR text. The hero canvas (Phase 3) mounts after.
export const dynamic = "force-static";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        {/* Stepped boundary into the Positioning section (hero brief v2 §6):
            the dark surface rises highest in the center, lower at the
            shoulders, lowest at the edges. It sits BETWEEN the hero and the
            statement in document flow (not inside the statement) because the
            statement's -100vh sticky tuck would otherwise pull the cap up
            behind the hero where it could never reveal. z-[2] keeps it above
            the tucked statement, matching the hero's own stacking. */}
        <div aria-hidden="true" className="statement-cap relative z-[2]">
          <div className="statement-cap__step" />
        </div>
        <Positioning />
        <WorkSection />
        <ProofStrip />
        <Practice />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

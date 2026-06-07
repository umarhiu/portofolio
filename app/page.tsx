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

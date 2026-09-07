import { HeroStatic } from "@/components/home/HeroStatic";

/*
  Server wrapper. The hero is one static-first composition (HeroStatic) whose
  only client part is the small HeroPlay island (the verb-cycling controller),
  which SSRs its default state. No enhancer, no capability gate: the default
  frame is the complete experience everywhere; the controller adds play on top.
*/
export function Hero() {
  return (
    <section id="hero" aria-label="Introduction" className="relative">
      <HeroStatic />
    </section>
  );
}

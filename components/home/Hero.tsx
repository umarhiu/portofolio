import { HeroStatic } from "@/components/home/HeroStatic";
import { HeroTransition } from "@/components/home/HeroTransition";
import { GreetingPreloader } from "@/components/hero/GreetingPreloader";

/*
  Server wrapper. The hero is one static-first composition (HeroStatic) whose
  interactive part is the small HeroPlay island (the verb-cycling controller),
  which SSRs its default state. No enhancer, no capability gate: the default
  frame is the complete experience everywhere; a separate decorative island
  handles only the scroll-linked background handoff.
*/
export function Hero() {
  return (
    <><GreetingPreloader /><HeroTransition>
      <HeroStatic />
    </HeroTransition></>
  );
}

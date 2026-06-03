import { HeroStatic } from "@/components/home/HeroStatic";
import { HeroEnhancer } from "@/components/hero/HeroEnhancer";

/*
  Server wrapper. The static hero renders for first paint (LCP) and for every
  fallback path. The enhancer is a client island that, only on a capable
  desktop, mounts the WebGL delamination scene and hides the static layout.
*/
export function Hero() {
  return (
    <section id="hero" aria-label="Introduction" className="relative">
      <HeroStatic />
      <HeroEnhancer />
    </section>
  );
}

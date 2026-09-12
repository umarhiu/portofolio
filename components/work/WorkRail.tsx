"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";

// w and h are the covers' real pixel sizes. They are declared on each <img> so
// the browser can reserve the right box before the file decodes; without them
// every cover resized the row on arrival, and the row's width is what the
// scroll travel is measured from. They are not all one shape: four squares,
// one landscape, one portrait, which is why each frame takes its proportion
// from its own cover rather than from a fixed ratio.
const studies = [
  { title: "Reusely Dashboard", image: "dashboard-laptop-mockup", w: 1254, h: 1254, tags: ["SAAS", "UI/UX"] },
  { title: "Reusely Design System", image: "reusely-studio-mockup", w: 1254, h: 1254, tags: ["SYSTEMS", "PROTOTYPE"] },
  { title: "Reusely Trade-in", image: "reusely-tablet-mockup", w: 1254, h: 1254, tags: ["COMMERCE", "UI/UX"] },
  { title: "RS Muhammadiyah", image: "hospital-handheld-mockup", w: 1254, h: 1254, tags: ["HEALTHCARE", "WEB"] },
  { title: "Volunteer App", image: "volunteer-mobile-mockup", w: 1024, h: 1536, tags: ["MOBILE", "UI/UX"] },
  { title: "Banding.ID", image: "banding-laptop-mockup", w: 1536, h: 1024, tags: ["SAAS", "UI/UX"] },
];
const capable = "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (min-height: 700px) and (pointer: fine)";

function Card({ index, position }: { index: number; position: MotionValue<number> }) {
  const study = studies[index];
  const scale = useTransform(position, p => 1 - .09 * Math.min(1, Math.abs(p - index)));
  return <motion.li className="work-gallery__card" style={{ scale }}>
    <div className="work-gallery__frame">
      {/* The plate is the mat the cover sits on. It exists as an element, not
          as a background on the img, so the photo can carry its own corner
          radius; see .work-gallery__plate in globals.css. */}
      <div className="work-gallery__plate">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/images/featured-work/${study.image}.webp`} alt={`${study.title} device mockup`} width={study.w} height={study.h} draggable={false} loading={index < 2 ? "eager" : "lazy"} decoding="async" />
      </div>
      <div className="work-gallery__caption">
        <div className="work-gallery__name"><span className="work-gallery__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h3>{study.title}</h3></div>
        <ul aria-label="Project categories">{study.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
      </div>
    </div>
  </motion.li>;
}
function Heading() {
  return <header className="work-gallery__heading">
    <h2 className="font-display font-extrabold tracking-tight">Featured Work</h2>
    <p>I blend technology, creativity, and empathy to craft seamless experiences that bridge people, spaces, and services.</p>
  </header>;
}
function ScrollGallery() {
  const track = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [travel, setTravel] = useState(0);
  const [index, setIndex] = useState(0);
  const distance = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const position = useTransform(scrollYProgress, [0, 1], [0, studies.length - 1]);
  const x = useTransform(() => -scrollYProgress.get() * distance.get());
  useMotionValueEvent(position, "change", p => setIndex(Math.round(p)));
  useEffect(() => {
    const ul = list.current;
    if (!ul) return;
    const measure = () => {
      const first = ul.firstElementChild as HTMLElement | null;
      const last = ul.lastElementChild as HTMLElement | null;
      if (!first || !last) return;
      // Cards are no longer one width: each frame takes its proportion from
      // its cover, so slot * (n - 1) would measure the first card six times.
      // Travel is the gap between the first and last card CENTRES, read from
      // layout. offsetLeft and offsetWidth are layout values, so the active
      // card's scale transform cannot feed back into them.
      const centre = (el: HTMLElement) => el.offsetLeft + el.offsetWidth / 2;
      const next = centre(last) - centre(first);
      // Each end needs its own centring pad, which CSS cannot express because
      // neither card's width is known to it. Writing these changes the list's
      // size and would re-enter through the ResizeObserver, so only write on a
      // real change.
      const left = `${Math.max(0, (window.innerWidth - first.offsetWidth) / 2)}px`;
      const right = `${Math.max(0, (window.innerWidth - last.offsetWidth) / 2)}px`;
      if (ul.style.paddingLeft !== left) ul.style.paddingLeft = left;
      if (ul.style.paddingRight !== right) ul.style.paddingRight = right;
      distance.set(next); setTravel(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(ul);
    // Observe every card, not just the first: a lazily decoded cover changes
    // only its own width, and the travel depends on all of them.
    for (const li of ul.children) observer.observe(li);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [distance]);
  return <div ref={track} className="work-gallery" style={{ height: `calc(100dvh + ${travel}px)` }} data-gallery-mode="scroll" data-gallery-index={index}>
    <div className="work-gallery__stage">
      <motion.ul ref={list} className="work-gallery__list" style={{ x }}>
        {studies.map((s, i) => <Card key={s.image} index={i} position={position} />)}
      </motion.ul>
    </div>
  </div>;
}
function NativeGallery() {
  const list = useRef<HTMLUListElement>(null);
  const position = useMotionValue(0);
  return <div className="work-gallery work-gallery--native" data-gallery-mode="native">
    <ul ref={list} className="work-gallery__list" tabIndex={0} aria-label="Selected projects; scroll horizontally to explore" onScroll={() => {
      // Nearest card centre to the scroller's centre, since the cards are not
      // a uniform width here either.
      const ul = list.current!;
      const mid = ul.scrollLeft + ul.clientWidth / 2;
      let best = 0, bestGap = Infinity;
      [...ul.children].forEach((li, i) => {
        const el = li as HTMLElement;
        const gap = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
        if (gap < bestGap) { bestGap = gap; best = i; }
      });
      position.set(best);
    }}>
      {studies.map((s, i) => <Card key={s.image} index={i} position={position} />)}
    </ul>
  </div>;
}
export function WorkRail() {
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => {
    const query = matchMedia(capable);
    const update = () => setEnhanced(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return <><Heading />{enhanced ? <ScrollGallery /> : <NativeGallery />}</>;
}

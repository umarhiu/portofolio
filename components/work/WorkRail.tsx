"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";

const studies = [
  { title: "Reusely Dashboard", image: "dashboard-laptop-mockup", tags: ["SAAS", "UI/UX"] },
  { title: "Reusely Design System", image: "reusely-studio-mockup", tags: ["SYSTEMS", "PROTOTYPE"] },
  { title: "Reusely Trade-in", image: "reusely-tablet-mockup", tags: ["COMMERCE", "UI/UX"] },
  { title: "RS Muhammadiyah", image: "hospital-handheld-mockup", tags: ["HEALTHCARE", "WEB"] },
  { title: "Volunteer App", image: "volunteer-mobile-mockup", tags: ["MOBILE", "UI/UX"] },
  { title: "Banding.ID", image: "banding-laptop-mockup", tags: ["SAAS", "UI/UX"] },
];
const capable = "(prefers-reduced-motion: no-preference) and (min-width: 1024px) and (min-height: 700px) and (pointer: fine)";

function Card({ index, position }: { index: number; position: MotionValue<number> }) {
  const study = studies[index];
  const scale = useTransform(position, p => 1 - .09 * Math.min(1, Math.abs(p - index)));
  return <motion.li className="work-gallery__card" style={{ scale }}>
    <div className="work-gallery__frame">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/images/featured-work/${study.image}.webp`} alt={`${study.title} device mockup`} draggable={false} loading={index < 2 ? "eager" : "lazy"} decoding="async" />
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
      // Measure layout width, not animated bounds, to avoid feedback jitter.
      const slot = (ul.firstElementChild as HTMLElement).offsetWidth + parseFloat(getComputedStyle(ul).columnGap);
      const next = slot * (studies.length - 1);
      distance.set(next); setTravel(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(ul); observer.observe(ul.firstElementChild!);
    return () => observer.disconnect();
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
      const ul = list.current!;
      const slot = (ul.firstElementChild as HTMLElement).offsetWidth + parseFloat(getComputedStyle(ul).columnGap);
      const p = Math.max(0, Math.min(studies.length - 1, ul.scrollLeft / slot));
      position.set(p);
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

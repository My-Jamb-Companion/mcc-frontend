"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import Link from "next/link";
import {Icon} from "@mcc/ui";
import {useExploreBanners} from "@/src/features/explore/hooks/useExploreBanners";
import type {ApiExploreBanner} from "@/src/features/explore/services/banners.service";
import {isExternalLink, nextSlide, prevSlide, slideAt} from "@/src/features/explore/helper/slider";

const AUTOPLAY_MS = 5500;

function SlideButton({banner}: {banner: ApiExploreBanner}) {
  if (!banner.button_label || !banner.link_url) return null;
  const className =
    "flex items-center gap-2 w-fit pl-4 pr-1 py-1.5 rounded-full bg-background text-xs font-semibold text-foreground shadow-sm text-nowrap";
  const inner = (
    <>
      {banner.button_label}
      <span className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center">
        <Icon icon="ph:arrow-right-bold" size={10} />
      </span>
    </>
  );
  return isExternalLink(banner.link_url) ? (
    <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={banner.link_url} className={className}>
      {inner}
    </Link>
  );
}

function Slide({banner}: {banner: ApiExploreBanner}) {
  const hasImage = !!banner.image_url;
  return (
    <div
      className="relative flex h-full w-full items-center overflow-hidden rounded-2xl p-6 max-sm:p-4"
      style={{backgroundColor: banner.bg_color, color: banner.text_color}}
    >
      {hasImage && (
        <>
          <img src={banner.image_url!} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          {/* Keeps the caption readable over any picture. */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" aria-hidden="true" />
        </>
      )}
      <div className="relative z-10 flex max-w-[60%] flex-col gap-3 max-sm:max-w-[85%]">
        <p className="text-sm font-semibold leading-snug max-sm:text-[13px]" style={{color: hasImage ? "#fff" : banner.text_color}}>
          {banner.caption}
        </p>
        <SlideButton banner={banner} />
      </div>
    </div>
  );
}

/**
 * The Explore slider. Slides sit in a horizontal scroll track that snaps to each one, so a swipe, a trackpad scroll,
 * the arrows and the dots all move it the same smooth way, and the next slide peeks in at the edge. It advances
 * itself slowly, and stops while the reader is pointing at it, touching it, or has asked for less motion.
 */
export default function BannerCarousel() {
  const {data: banners = [], isLoading} = useExploreBanners();
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;

  const pitch = useCallback(() => {
    const track = trackRef.current;
    const first = track?.children[0] as HTMLElement | undefined;
    const second = track?.children[1] as HTMLElement | undefined;
    if (!first) return 0;
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      track.scrollTo({left: index * pitch(), behavior: "smooth"});
    },
    [pitch],
  );

  // Follow the track wherever it is moved to, without re-rendering on every pixel.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCurrent(slideAt(track.scrollLeft, pitch(), count)));
    };
    track.addEventListener("scroll", onScroll, {passive: true});
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [count, pitch]);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => goTo(nextSlide(slideAt(trackRef.current?.scrollLeft ?? 0, pitch(), count), count)), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [count, paused, goTo, pitch]);

  if (isLoading) return <div className="h-32 w-full animate-pulse rounded-2xl bg-muted/10 sm:h-36" aria-hidden="true" />;
  if (count === 0) return null;

  return (
    <div
      className="group relative flex w-full flex-col gap-3"
      role="region"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="relative">
        <div
          ref={trackRef}
          className="scrollbar-hide flex h-32 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth overscroll-x-contain sm:h-36"
        >
          {banners.map((banner, i) => (
            <div
              key={banner.banner_id}
              className={`h-full shrink-0 snap-start ${count === 1 ? "w-full" : "w-[88%] sm:w-[calc(100%-5rem)]"}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
            >
              <Slide banner={banner} />
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(prevSlide(current, count))}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 sm:flex cursor-pointer"
            >
              <Icon icon="ph:caret-left-bold" size={14} />
            </button>
            <button
              type="button"
              onClick={() => goTo(nextSlide(current, count))}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 sm:flex cursor-pointer"
            >
              <Icon icon="ph:caret-right-bold" size={14} />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex items-center gap-1.5 pl-1">
          {banners.map((banner, i) => (
            <button
              key={banner.banner_id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current}
              className={`cursor-pointer rounded-full transition-all duration-300 ${
                i === current ? "h-1.5 w-5 bg-foreground" : "h-1.5 w-1.5 bg-muted/40 hover:bg-muted/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

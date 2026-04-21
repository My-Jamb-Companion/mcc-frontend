"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { slides } from "../constants/slides";
import { AnimatePresence, FadeInUp, ProgressBar, SlideTransition, Stagger } from "@mcc/ui";

export default function SignUpSlider() {
  const [slide, setSlide] = useState(0);
  const [width, setWidth] = useState(0);

  const nextSlide = (id: number) => setSlide(id);

  useEffect(() => {
    const interval = setInterval(() => {
      setWidth((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 150);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      setWidth(0);
    };
  }, [slide]);

  return (
    <div className="relative flex-1 overflow-hidden w-full h-full perspective-distant">
      <AnimatePresence mode="wait">
        <SlideTransition key={slide}>
          <Image
            src={slides[slide].img}
            alt="Signup Slider"
            fill
            className="object-cover object-center"
          />
        </SlideTransition>
      </AnimatePresence>

      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end px-8 py-10 text-white backdrop-blur-[2px]">
        <AnimatePresence mode="wait">
          <Stagger key={slide}>

              <h3 className="text-5xl font-bold" style={{ fontFamily: "Recoleta" }}>
                {slides[slide].title}
              </h3>
            

              <FadeInUp>
                <p className="text-sm mt-2 text-white/90">
                  {slides[slide].description}
                </p>
              </FadeInUp>
          </Stagger>
        </AnimatePresence>

        <div className="mt-20 flex gap-2">
          {slides.map((s) => {
            const active = slide === s.id - 1;
          return (
            <div
              key={s.id}
              className="w-full cursor-pointer"
              onClick={() => nextSlide(s.id - 1)}
            >
              <div className="mb-4 rounded-full bg-white/30 w-full h-0.5 overflow-hidden">


                              <ProgressBar
                    active={active}
                    progress={width}
                    color={
                      slide === slides.length - 1
                        ? "#90CD22"
                        : slide === 0
                        ? "#fff"
                        : "#6717DE"
                    }
                  />
              </div>

              <p className="text-xs font-medium text-white/90">{s.info}</p>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}

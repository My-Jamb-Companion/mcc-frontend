"use client";

import Image from "next/image";
import {useEffect, useState} from "react";
import {slides} from "../constants/slides";
import {motion, AnimatePresence} from "framer-motion";

export default function SignUpSlider() {
  const [slide, setSlide] = useState(0);
  const [width, setWidth] = useState(0);

  const nextSlide = (id: number) => setSlide(id);

  useEffect(() => {
    const interval = setInterval(() => {
      setWidth((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 50);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      setWidth(0);
    };
  }, [slide]);

  return (
    <motion.div className="relative flex-1 overflow-hidden w-full h-full perspective-distant">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{opacity: 0, scale: 1.1}}
          animate={{
            opacity: 1,
            scale: 1.05,
            x: [0, -10, 0],
            y: [0, -10, 0],
          }}
          exit={{opacity: 0, scale: 1}}
          transition={{duration: 1, ease: "easeInOut"}}
          className="absolute inset-0"
        >
          <Image
            src={slides[slide].img}
            alt="Signup Slider"
            fill
            className="object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
      {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent)]" /> */}

      <div className="absolute inset-0 flex flex-col justify-end px-8 py-10 text-white backdrop-blur-[2px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{
              hidden: {},
              show: {
                transition: {staggerChildren: 0.08},
              },
            }}
          >
            <motion.h3
              variants={{
                hidden: {opacity: 0, y: 30, scale: 0.95},
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {type: "spring", stiffness: 120},
                },
              }}
              className="text-5xl font-bold"
              style={{fontFamily: "Recoleta"}}
            >
              {slides[slide].title}
            </motion.h3>

            <motion.p
              variants={{
                hidden: {opacity: 0, y: 15},
                show: {opacity: 1, y: 0},
              }}
              className="text-sm font-medium mt-2 text-white/90"
            >
              {slides[slide].description}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-20 flex gap-2">
          {slides.map((s) => (
            <div
              key={s.id}
              className="w-full cursor-pointer"
              onClick={() => nextSlide(s.id - 1)}
            >
              <div className="mb-4 rounded-full bg-white/30 w-full h-0.5 overflow-hidden">
                <motion.div
                  className="h-0.5 origin-left"
                  animate={{
                    scaleX: slide === s.id - 1 ? width / 100 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 70,
                    damping: 18,
                  }}
                  style={{
                    background:
                      slide === slides.length - 1
                        ? "#90CD22"
                        : slide === 0
                          ? "#fff"
                          : "#6717DE",
                  }}
                />
              </div>

              <p className="text-xs font-medium text-white/90">{s.info}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

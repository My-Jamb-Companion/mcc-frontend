"use client";
import Image from "next/image";
import img from "../../../../public/tower.jpg";
import {useEffect, useState} from "react";
import {slides} from "../constants/slides";

export default function SignUpSlider() {
  const [slide, setSlide] = useState(0);
  const [width, setWidth] = useState(0);

  const nextSlide = (id: number) => {
    setSlide(id);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setWidth((prev) => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
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
    <>
      <div className="relative flex-1 overflow-hidden w-full h-full">
        <Image
          src={img}
          alt="Signup Slider"
          fill
          className="object-cover object-center"
        />
      </div>

      <div
        className="bg-muted/70 h-full w-full absolute top-0 left-0 flex flex-col justify-end px-8 py-10"
        // style={{
        //   color:
        //     slide === 0 || slide === slides.length - 1 ? "#fff" : "#4E4E55",
        // }}
      >
        <div className="w-full">
          <div className="transition-all duration-300">
            <h3 className="text-5xl font-bold" style={{fontFamily: "Recoleta"}}>
              {slides[slide].title}
            </h3>
            <p className="text-sm font-medium mt-2">
              {slides[slide].description}
            </p>
          </div>
        </div>

        <div className="mt-20 flex gap-2">
          {slides.map((s) => (
            <div
              key={s.id}
              className="w-full cursor-pointer"
              onClick={() => nextSlide(s.id - 1)}
            >
              <div className="mb-4 rounded-full bg-white/30 w-full h-0.5">
                <div
                  className="mb-4 rounded-full h-0.5 transition-all duration-300"
                  style={{
                    width: slide === s.id - 1 ? `${width}%` : "0%",
                    background:
                      slide === slides.length - 1
                        ? "#90CD22"
                        : slide === 0
                          ? "#fff"
                          : "#6717DE",
                  }}
                />
              </div>
              <p className="text-xs font-medium">{s.info}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

"use client";
import {useRouter, useSearchParams} from "next/navigation";
import {dummyPrograms} from "../constants/dummyData";
import {Button, Icon} from "@mcc/ui";
import {FormInputs} from "@mcc/features";
import {useState} from "react";
import StatsSummaryRow from "@/src/components/StatsSummary";

export default function OpenProgram() {
  const params = useSearchParams();
  const router = useRouter();

  const id = params.get("id");
  if (!id) {
    router.push("/dashboard/exam-program");
  }
  const item = dummyPrograms.find((item) => item.id === id);

  const [filter, setFilter] = useState("last 7 days");
  return (
    <section className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{item?.title}</h1>
      </div>

      <div className="flex flex-col h-full border border-muted/20 rounded-2xl px-6 py-8 ">
        <div className="flex items-center justify-between gap-4">
          <p className="text-2xl font-semibold">Program Overview</p>
          <div className="grid grid-cols-2 w-full max-w-75 gap-2">
            <FormInputs
              type="select"
              value={filter}
              onChange={setFilter}
              placeholder="Filter"
              selectRadius="full"
              options={[
                {label: "last 7 days", value: "last 7 days"},
                {label: "last month", value: "last month"},
              ]}
            />
            <Button variant="outline">Export</Button>
          </div>
        </div>

        <div className="mt-4">
          <StatsSummaryRow />
        </div>

        <hr className="border-muted/20 my-10" />

        <div className="flex items-center gap-3 max-w-95 ml-auto">
          <Button
            variant="outline"
            leftIcon={<Icon icon="ri:edit-circle-line" size={18} />}
          >
            Edit Program
          </Button>
          <Button
            leftIcon={
              <Icon icon="material-symbols:cloud-off-outline" size={18} />
            }
            variant="outline"
            className="text-nowrap"
          >
            Unpublish program
          </Button>
        </div>

        <div className="grid grid-cols-2 border border-muted/20 rounded-2xl px-6 py-8 ">
          <div className="flex flex-col gap-3">
            <Hero />
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-2xl font-semibold">Program Overview</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="relative w-full rounded-2xl overflow-visible">
      {/* Main Image */}
      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-amber-800">
        <img
          src={mainImage}
          alt="Course preview"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Play Button — top right */}
      <button
        onClick={onPlay}
        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform duration-200"
      >
        <Icon icon="solar:play-bold" size={16} color="#000" />
      </button>

      {/* Rating — bottom right, inside image */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-0.5">
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-white drop-shadow">
            {rating}
          </span>
          <div className="flex items-center gap-0.5">
            {Array.from({length: 5}).map((_, i) => (
              <Icon
                key={i}
                icon={
                  i < fullStars
                    ? "solar:star-bold"
                    : hasHalf && i === fullStars
                      ? "solar:star-half-bold"
                      : "solar:star-outline"
                }
                size={13}
                color="#f59e0b"
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-white/80 drop-shadow">
          {totalRatings} ratings
        </span>
      </div>

      {/* Instructor Thumbnail — bottom left, overflows outside image */}
      <div className="absolute -bottom-6 left-4 w-20 h-20 rounded-2xl overflow-hidden border-[3px] border-white shadow-md">
        <img
          src={instructorImage}
          alt="Instructor"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

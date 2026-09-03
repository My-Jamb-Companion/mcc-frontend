"use client";
import {useRouter} from "next/navigation";
import {Button, Icon, showError, showSuccess} from "@mcc/ui";
import {FormInputs} from "@mcc/features";
import {useEffect, useRef, useState} from "react";
import StatsSummaryRow from "@/src/components/StatsSummary";
import CourseSideDetail from "./CourseSideDetails";
import CourseInfo from "./CourseInfo";
import {useCourse} from "../hooks/useCourses";
import {
  getApiErrorMessage,
  publishCourse,
  unpublishCourse,
} from "../services/course.service";
import {AdditionalCourseTypes, CoursesFormValues} from "../types/types";
import {STATUS_STYLES} from "./CoursesRow";
import Image from "next/image";

export default function OpenCourse({id}: {id: string}) {
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.push("/dashboard/courses");
    }
  }, [id, router]);

  const {
    data,
    isLoading: isLoadingCourse,
    isError: isCourseError,
    refetch: refetchCourse,
  } = useCourse(id);
  const item = data as
    | (CoursesFormValues & Partial<AdditionalCourseTypes>)
    | undefined;

  const [filter, setFilter] = useState("last 7 days");
  const status = STATUS_STYLES[item?.status || "draft"];

  if (isLoadingCourse) {
    return <p className="text-sm text-muted">Loading course…</p>;
  }

  if (isCourseError) {
    return (
      <p className="text-sm text-red-600">
        Failed to load this course. Please try again.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-6 ">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{item?.courseName}</h1>
      </div>

      <div className="flex flex-col h-full border border-muted/20 rounded-2xl px-6 py-8 flex-1 ">
        <div className="flex items-center justify-between gap-4">
          <p className="text-2xl font-semibold">Course Overview</p>
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

        <div className="grid grid-cols-[1.5fr_1fr] gap-5 justify-between ">
          <div className="flex flex-col gap-6 ">
            <Hero
              rating={item?.stats?.rating || 0}
              totalRatings={item?.stats?.reviewCount || 0}
              // mainImage={item?.upload?.coverImage?.previewUrl || ""}
              promoVideoSrc={item?.upload?.promoVideo?.previewUrl || ""}
              poster={item?.upload?.coverImage?.previewUrl || ""}
              instructorAvatar={item?.instructor?.avatar || ""}
              onPlay={() => {}}
            />

            <div className="mt-8">
              <CourseInfo
                instructor={item?.instructorName}
                title={item?.courseName}
                description={item?.description}
                topics={item?.content.topics}
              />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 ml-auto">
              <span
                className={`flex shrink-0 items-center gap-1.5 text-sm font-medium border rounded-md px-2 bg-${status.bg} ${status.text}`}
              >
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                {status.label}
              </span>

              <Button
                variant="outline"
                leftIcon={<Icon icon="ri:edit-circle-line" size={18} />}
                onClick={() =>
                  router.push(`/dashboard/courses/edit-course?id=${id}`)
                }
              >
                Edit Course
              </Button>
              <Button
                leftIcon={
                  <Icon
                    icon={
                      item?.status === "published"
                        ? "material-symbols:cloud-off-outline"
                        : "material-symbols:cloud-outline"
                    }
                    size={18}
                  />
                }
                variant="outline"
                className="text-nowrap"
                onClick={async () => {
                  if (!item) return;
                  try {
                    if (item.status === "published") {
                      await unpublishCourse(id);
                      showSuccess("Course moved back to drafts.");
                    } else {
                      await publishCourse(id);
                      showSuccess("Course published successfully!");
                    }
                    refetchCourse();
                  } catch (err) {
                    showError(
                      getApiErrorMessage(
                        err,
                        "Failed to update course status. Please try again.",
                      ),
                    );
                  }
                }}
              >
                {item?.status === "published"
                  ? "Unpublish course"
                  : "Publish course"}
              </Button>
            </div>
            <CourseSideDetail
              price={Number(item?.price) || 0}
              currency={item?.currency || ""}
              lessons={
                item?.content?.topics.flatMap((topic) =>
                  topic.modules.flatMap((module) => module.content),
                ).length || 0
              }
              difficulty={item?.level || ""}
              stats={item?.stats || {}}
              features={item?.features || {}}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Hero({
  promoVideoSrc,
  poster,
  rating,
  totalRatings,
  instructorAvatar,
  onPlay,
}: HeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {
        // console.warn("Video playback error:", err);
        return;
      });
    }

    if (onPlay) onPlay();
  };

  return (
    <div className="relative w-full rounded-2xl overflow-visible">
      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-amber-800">
        <video
          ref={videoRef}
          src={promoVideoSrc}
          poster={poster}
          controls={isPlaying}
          className="w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      <button
        type="button"
        onClick={togglePlay}
        className="absolute top-3 right-3 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform duration-200 cursor-pointer"
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        <Icon
          icon={isPlaying ? "solar:pause-bold" : "solar:play-bold"}
          size={16}
          color="#000"
        />
      </button>

      {!isPlaying && (
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-0.5 pointer-events-none">
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
      )}

      {!isPlaying && (
        <div className="bg-white absolute -bottom-6 left-4 z-10 w-25 h-25 rounded-2xl overflow-hidden border-[3px] border-white shadow-md">
          <div className="relative w-full h-full">
            <Image
              src={instructorAvatar}
              alt="Instructor"
              className="w-full h-full object-cover"
              fill
            />
          </div>
        </div>
      )}
    </div>
  );
}
type HeroProps = {
  promoVideoSrc: string;
  poster: string;
  instructorAvatar: string;
  rating: number;
  totalRatings: number;
  onPlay?: () => void;
};

import {useMemo} from "react";
import {Lessons} from "../../constants/demoCourses";

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function useLessonsDuration(lessons: Lessons[]) {
  return useMemo(() => {
    const totalSeconds = lessons.reduce(
      (acc, lesson) => acc + lesson.duration,
      0,
    );

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,

      formatted: hours > 0 ? `${hours}hr ${minutes}min` : `${minutes}min`,
    };
  }, [lessons]);
}

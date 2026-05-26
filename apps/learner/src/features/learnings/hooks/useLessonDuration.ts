import {useMemo} from "react";
import {Lesson} from "../components/course/CourseModules";

export function useLessonsDuration(lessons: Lesson[]) {
  return useMemo(() => {
    let totalSeconds = 0;

    lessons.forEach((lesson) => {
      const parts = lesson.duration.split(":").map(Number);

      let seconds = 0;

      // hh:mm:ss
      if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      }

      // mm:ss
      else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
      }

      totalSeconds += seconds;
    });

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

/** The lecture that follows `lectureId` in a program's order, or null after the last one (or for an unknown id). */
export function nextLectureId(lectures: {lecture_id: string}[], lectureId: string): string | null {
  const index = lectures.findIndex((l) => l.lecture_id === lectureId);
  return index >= 0 && index < lectures.length - 1 ? lectures[index + 1].lecture_id : null;
}

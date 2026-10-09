interface EnrolledLike {
  progress_percent: number;
  completed_at?: string | null;
}

/** The student's own counts for the Skills header: what exists to take, what they're in the middle of, what they finished. */
export function skillsStats(available: number, enrolled: EnrolledLike[]) {
  const completed = enrolled.filter((c) => !!c.completed_at || c.progress_percent >= 100).length;
  return [
    {label: "Courses available", value: String(available)},
    {label: "In progress", value: String(enrolled.length - completed)},
    {label: "Completed", value: String(completed)},
  ];
}

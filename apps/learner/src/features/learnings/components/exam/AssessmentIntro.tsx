import {minutesLabel} from "@/src/features/learnings/helper/assessmentFlow";
import SmartZoneIntro from "@/src/features/smart-zone/components/SmartZoneIntro";
import type {ApiAssessmentSession} from "@/src/features/exams/services/exam.service";

/** "Ready for the Smart Zone?": what it is, how long it takes, and the start button. */
export default function AssessmentIntro({session, onStart}: {session: ApiAssessmentSession; onStart: () => void}) {
  return (
    <SmartZoneIntro
      subject={session.title}
      questionCount={session.question_count}
      estimate={minutesLabel(session.estimated_minutes)}
      timerMinutes={session.time_limit_minutes}
      passingScore={session.passing_score}
      onStart={onStart}
    />
  );
}

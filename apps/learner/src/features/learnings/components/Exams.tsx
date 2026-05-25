"use client";

import ScrollRow from "../../dashboard/components/RowScroll";
import {demoStats} from "../constants/demoHeaderStats";
import {demoCourses} from "../constants/demoCourses";
import LearningsHeader from "../LearningsHeader";
import CourseCard from "../../dashboard/components/CourseCard";
import ExamCardSkeleton from "../../dashboard/components/ExamCardSkeleton";
import ExamCard from "../../dashboard/components/ExamCard";
import {exams} from "../../constants/ExamCards";

export default function Exams() {
  return (
    <section className="py-6">
      <LearningsHeader
        stats={demoStats}
        title="Prepare for Exam"
        paragraph="
              Python is a versatile programming language known for its simplicity
              and readability. Learning Python boosts your ability to develop web
              applications, data analysis tools, and automation scripts, making it
              essential for many tech careers.
        "
      />

      <div className="pt-16">
        <ScrollRow title="Programs you're taking already">
          {demoCourses.map((card) => (
            <div key={card.id} className="shrink-0 w-72">
              <CourseCard
                image={card.img || "/assets/images/tower.jpg"}
                course={card.course}
                title={card.topic}
                completePercent={card.completed}
                onClick={() => console.log("open course")}
              />
            </div>
          ))}
        </ScrollRow>
      </div>

      <div className="pt-18">
        <ScrollRow
          variant="card"
          title="Practice Exams"
          subTitle="Pick up where you left off"
          // isLoading={isExamLoading}
          skeleton={<ExamCardSkeleton />}
          skeletonCount={5}
        >
          {exams.map((exam, i) => (
            <ExamCard key={i} exam={exam} />
          ))}
        </ScrollRow>
      </div>
    </section>
  );
}

"use client";

import {examDetails} from "@/src/features/constants/demoExams";
import {useParams} from "next/navigation";
import ExamHero from "./ExamHero";
import ExamInfo from "./ExamInfo";
import Link from "next/link";
import PaymentDetails from "../PaymentDetails";
import ExamDetailsSidebar from "./ExamDetailsSidebar";
import {useExam} from "./context/ExamContext";

export default function ExamPayment() {
  const {id} = useParams();
  const exam = examDetails.find((c) => c.slug === id);
  const examContext = useExam();

  if (!exam) return null;

  const selectedSubjectIds = examContext?.selectedSubjectIds || [];
  // Only unpaid subjects appear on the payment page
  const unpaidSelected = exam.subjects?.filter(
    (s) => selectedSubjectIds.includes(s.id) && !s.isEnrolled,
  );
  const price = unpaidSelected?.reduce((sum, s) => sum + s.price, 0) || 0;

  return (
    <section className="px-4">
      <nav className="flex items-center gap-1 text-sm py-8">
        <Link href="/learnings" className="text-subtle hover:underline">
          Course
        </Link>

        <span className="text-subtle">/</span>

        <Link
          href={`/learnings/exams/${id}`}
          className="text-subtle hover:underline text-nowrap truncate"
        >
          {exam.title}
        </Link>

        <>
          <span className="text-subtle">/</span>
          <span className="text-muted/50 cursor-default text-nowrap truncate">
            Payment Details
          </span>
        </>
      </nav>

      <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
        <div className="flex flex-col gap-5 pb-8 max-sm:hidden">
          <div className="pb-14">
            <ExamHero
              mainImage={exam.imgBig}
              instructorImage={exam.imgSmall}
              rating={exam.rating}
              totalRatings={exam.totalRatings}
              // onPlay={() => setVideoOpen(true)}
            />
          </div>

          <ExamInfo
            subjects={exam.subjects}
            instructor={exam.instructor}
            title={exam.title}
            description={exam.description}
            curriculum={exam.curriculum}
            isPaying
            slug={exam.slug}
            currency={exam.currency}
          />

          <ExamDetailsSidebar
            price={price}
            currency={exam.currency}
            lessons={exam.meta.lessons}
            difficulty={exam.meta.difficulty}
            // tags={exam.tags}
            extraTagsCount={exam.extraTagsCount}
            stats={exam.stats}
            features={exam.features}
            isPaying
          />
        </div>

        <div className="w-full sm:w-fit mx-auto ">
          <PaymentDetails price={price} currency={exam.currency} />
        </div>
      </div>
    </section>
  );
}

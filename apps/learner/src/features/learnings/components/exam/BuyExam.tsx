import Link from "next/link";
import {useRouter} from "next/navigation";
import ExamDetailsSidebar from "./ExamDetailsSidebar";
import ExamHero from "./ExamHero";
import {ExamDetail} from "@/src/features/constants/demoExams";
import ExamInfo from "./ExamInfo";
import {useExam} from "./context/ExamContext";

export default function BuyExam({exam}: {exam: ExamDetail}) {
  const router = useRouter();
  const examContext = useExam();

  // Deconstruct what we need from the context safely
  const selectedSubjectIds = examContext?.selectedSubjectIds || [];
  const setViewEnrolledCourse = examContext?.setViewEnrolledCourse;

  const selectedSubjects = exam.subjects?.filter((s) =>
    selectedSubjectIds.includes(s.id),
  );

  // Only unpaid subjects contribute to the price
  const unpaidSelected = selectedSubjects.filter((s) => !s.isEnrolled);
  const hasUnpaidSelection = unpaidSelected.length > 0;
  const dynamicPrice = unpaidSelected.reduce((sum, s) => sum + s.price, 0);

  return (
    <section className="px-4 pb-5">
      <nav className="flex items-center gap-1 text-sm py-8">
        <Link href="/learnings" className="text-subtle hover:underline">
          Course
        </Link>

        <span className="text-subtle">/</span>

        <span className="text-muted/50 cursor-default text-nowrap truncate">
          {exam.title}
        </span>
      </nav>

      <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
        <div className="pb-8">
          <div className="pb-14">
            <ExamHero
              mainImage={exam.imgBig}
              instructorImage={exam.imgSmall}
              rating={exam.rating}
              totalRatings={exam.totalRatings}
            />
          </div>

          <ExamInfo
            subjects={exam.subjects}
            instructor={exam.instructor}
            title={exam.title}
            description={exam.description}
            curriculum={exam.curriculum}
            currency={exam.currency}
            slug={exam.slug}
          />
        </div>

        <div>
          <ExamDetailsSidebar
            price={dynamicPrice}
            currency={exam.currency}
            lessons={exam.meta.lessons}
            difficulty={exam.meta.difficulty}
            extraTagsCount={exam.extraTagsCount}
            stats={exam.stats}
            features={exam.features}
            onEnroll={() =>
              router.push(`/learnings/exams/${exam.slug}/payment`)
            }
            // 1. Toggle the value to true instead of navigating away
            onAccess={() => {
              if (setViewEnrolledCourse) {
                setViewEnrolledCourse(true);
              }
            }}
            onGift={() => {}}
            isEnrollDisabled={selectedSubjectIds.length === 0}
            hasUnpaidSelection={hasUnpaidSelection}
          />
        </div>
      </div>
    </section>
  );
}

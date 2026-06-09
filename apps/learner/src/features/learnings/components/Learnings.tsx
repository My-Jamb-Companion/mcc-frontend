"use client";

import {exams} from "@/src/features/constants/ExamCards";
import BannerCarousel from "@/src/features/components/BannerCarousel";
import CourseCard from "@/src/features/components/CourseCard";
import CourseCardSkeleton from "@/src/features/components/CourseCardSkeleton";
import ExamCard from "@/src/features/components/ExamCard";
import ExamCardSkeleton from "@/src/features/components/ExamCardSkeleton";
import ScrollRow from "@/src/features/components/RowScroll";
import {demoCourses} from "@/src/features/constants/demoCourses";
import TopPickCard from "@/src/features/components/TopPickCard";

export default function Learnings() {
  return (
    <section className="flex flex-col gap-8 pb-20">
      <div className="mt-7">
        <BannerCarousel />
      </div>

      <div>
        <ScrollRow
          title="Continue learning here"
          // isLoading={isNextLoading}
          skeleton={<CourseCardSkeleton />}
          skeletonCount={4}
        >
          {demoCourses.map((card) => (
            <div key={card.id} className="shrink-0 w-72">
              <CourseCard
                image={card.img || "/assets/images/tower.jpg"}
                course={card.course}
                title={card.topic}
                completePercent={card.completed}
                // onClick={() => console.log("open course")}
              />
            </div>
          ))}
        </ScrollRow>
      </div>

      <div>
        <ScrollRow title="What to learn next?">
          {[6, 7, 8, 9].map((card) => (
            <div key={card} className="shrink-0 w-72">
              <CourseCard
                image="/assets/images/tower.jpg"
                instructor="Brooke Graser"
                rating={4.7}
                reviewCount="5.2k"
                title="Intro to Procreate: Illustration on the iPad (UPDATED)"
                tags={[
                  "Procreate",
                  "Drawing Tablet",
                  "Beginner",
                  "Digital Art",
                  "iPad",
                ]}
                price={22345}
                originalPrice={3500}
                pricePerModule={75}
                // onClick={() => console.log("open course")}
              />
            </div>
          ))}
        </ScrollRow>
      </div>

      <div>
        <ScrollRow
          variant="card"
          title="Practice Exams"
          subTitle="Best practice resources and environment for your exams"
          // isLoading={isExamLoading}
          skeleton={<ExamCardSkeleton />}
          skeletonCount={5}
        >
          {exams.map((exam, i) => (
            <ExamCard key={i} exam={exam} />
          ))}
        </ScrollRow>
      </div>

      <div>
        <p className="text-2xl font-semibold pb-4">Our top pick for you</p>
        <TopPickCard
          image="/assets/images/pencil.jpg"
          title="Complete web development course"
          description="Only web development course that you will need. Covers HTML, CSS, Tailwind, Node, React, MongoDB, Prisma, Deployment etc"
          isPremium
          rating={4.6}
          ratingCount="16,454"
          learners="43,876"
          price={10345}
          originalPrice={3500}
        />
      </div>
    </section>
  );
}

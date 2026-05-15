"use client";
import {Icon} from "@mcc/ui";
import BannerCarousel from "./BannerCarousel";
import QuickLinkCard from "./QuickLinkCard";
import {quickLinkCard} from "../constants/QuickLinks";
import LiveClassCard from "./LiveClassCard";
import ScrollRow from "./RowScroll";
import CourseCard from "./CourseCard";
import CourseCardSkeleton from "./CourseCardSkeleton";
import {useState} from "react";
import AskAICard from "./AskAI";
import {exams} from "../constants/ExamCards";
import ExamCard from "./ExamCard";

export default function Dashboard() {
  const [isContinueLoading, setIsContinueLoading] = useState(true);
  const [isNextLoading, setIsNextLoading] = useState(true);
  setTimeout(() => {
    setIsNextLoading(false);
  }, 5000);
  setTimeout(() => {
    setIsContinueLoading(false);
  }, 8000);

  return (
    <div className="col-start-2 max-sm:col-start-1 pt-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full h-14 w-14 bg-[#B190B6] overflow-hidden">
          <img
            src="/assets/images/profile.png"
            alt="profile image"
            className="w-full h-full"
          />
        </div>
        <div>
          <p className="text-muted font-medium">
            Good to have you,
            <span className="text-black dark:text-white"> Mac.</span>
          </p>
          <p className="flex items-center cursor-pointer text-btn-primary text-xs font-medium">
            <span>Personalize your experience</span>
            <Icon icon="ci:caret-right-sm" size={24} />
          </p>
        </div>
      </div>

      <div className="mt-7">
        <BannerCarousel />
      </div>

      <div className="mt-10 mx-auto w-[70%] max-sm:w-full">
        <LiveClassCard
          title="Mastering the Art of Articulation in Speaking: English Language."
          thumbnail="/assets/images/profile.png"
          instructorImage="/assets/images/pencil.jpg"
          instructorName="Salima Spiff"
          scheduledAt={new Date("2026-06-21T19:00:00")}
          datetime="7 PM WAT, Wed. 07 2026."
          // onJoin={() => console.log("joining...")}
        />
      </div>

      <div className="flex items-center gap-4 mt-8 max-md:flex-col">
        {quickLinkCard.map((card) => (
          <QuickLinkCard key={card.title} title={card.title} icon={card.icon} />
        ))}
      </div>

      <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-4 mt-8">
        <div className="flex flex-col gap-10">
          <ScrollRow
            showSeeAll
            title="Continue Learning"
            isLoading={isContinueLoading}
            skeleton={<CourseCardSkeleton />}
            skeletonCount={4}
          >
            {[1, 2, 3, 4, 5].map((card) => (
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
                  // onClick={() => console.log("open course")}
                />
              </div>
            ))}
          </ScrollRow>

          <ScrollRow
            title="What to learn next?"
            isLoading={isNextLoading}
            skeleton={<CourseCardSkeleton />}
            skeletonCount={4}
          >
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

        <div className="flex flex-col gap-7">
          <AskAICard />
          <ScrollRow
            variant="card"
            title="Practice Exams"
            subTitle="Pick up where you left off"
          >
            {exams.map((exam, i) => (
              <ExamCard key={i} exam={exam} />
            ))}
          </ScrollRow>
        </div>
      </div>
    </div>
  );
}

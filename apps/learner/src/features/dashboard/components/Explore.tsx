"use client";
import {Icon} from "@mcc/ui";
import BannerCarousel from "./BannerCarousel";
import LiveClassCard from "./LiveClassCard";
import IntroCard from "./IntroCard";
import {introCard} from "../constants/introcards";
import CourseCard from "./CourseCard";
import AskAICard from "./AskAICard";
import CourseScrollRow from "./CourseScrollRow";
import ExamsRowScroll from "./ExamsRowScroll";
import CourseHeroCard from "./CourseHeroCard";
import TopicsRow from "./TopicsRow";

export default function Explore() {
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
          scheduledAt={new Date("2026-04-21T19:00:00")}
          datetime="7 PM WAT, Wed. 07 2025."
          // onJoin={() => console.log("joining...")}
        />
      </div>

      <div className="flex items-center gap-4 mt-8 max-md:flex-col">
        {introCard.map((card) => (
          <IntroCard key={card.title} title={card.title} icon={card.icon} />
        ))}
      </div>

      <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-4 mt-8">
        <div className="flex flex-col gap-10">
          <CourseScrollRow title="Continue learning">
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
          </CourseScrollRow>

          <CourseScrollRow title="What to learn next?">
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
          </CourseScrollRow>
        </div>

        {/* Ai */}
        <div className="flex flex-col gap-7">
          <AskAICard />
          <ExamsRowScroll
            title="Prepare for an exams"
            subTitle="Best practice resources and environment for your exams"
          />
        </div>
      </div>

      <div className="pt-8">
        <p className="text-2xl font-semibold pb-6">Our top pick for you</p>
        <CourseHeroCard
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

      <div className="pt-8">
        <TopicsRow />
      </div>
      <div className="flex items-center justify-between px-16 py-8 text-sm font-medium max-sm:flex-col w-full max-sm:px-3">
        <p className="text-muted">© 2026 MC companion</p>
        <div className="flex items-center gap-5 max-sm:justify-between">
          <p className="underline text-muted hover:text-primary cursor-pointer">
            Terms and Conditions
          </p>
          <p className="underline text-muted hover:text-primary cursor-pointer">
            Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

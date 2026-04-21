"use client";
import {Icon} from "@mcc/ui";
import BannerCarousel from "./BannerCarousel";
import LiveClassCard from "./LiveClassCard";
import IntroCard from "./IntroCard";
import {introCard} from "../constants/introcards";
import CourseCard from "./CourseCard";
import AskAICard from "./AskAICard";

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
            <Icon icon="ci:caret-right-sm" width="24" height="24" />
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
          onJoin={() => console.log("joining...")}
        />
      </div>

      <div className="flex items-center gap-4 mt-8 max-sm:flex-col">
        {introCard.map((card) => (
          <IntroCard key={card.title} title={card.title} icon={card.icon} />
        ))}
      </div>

      <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 mt-8">
        <div className="flex flex-col gap-10">
          <div>
            <div className="flex items-center justify-between pb-5">
              <div className="flex items-center gap-6">
                <p className="font-semibold text-xl">Continue learning</p>
                <button className="rounded-full p-1 border border-muted/50 cursor-pointer">
                  <Icon icon="basil:arrow-right-solid" width="20" height="20" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-full p-1 border border-muted/50 cursor-pointer bg-hint/50 text-muted">
                  <Icon icon="basil:caret-left-solid" width="20" height="20" />
                </button>
                <button className="rounded-full p-1 border border-muted/50 cursor-pointer">
                  <Icon icon="basil:caret-right-solid" width="20" height="20" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6">
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
                onClick={() => console.log("open course")}
              />
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
                onClick={() => console.log("open course")}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between pb-5">
              <div className="flex items-center gap-6">
                <p className="font-semibold text-xl">What to learn next</p>
                <button className="rounded-full p-1 border border-muted/50 cursor-pointer">
                  <Icon icon="basil:arrow-right-solid" width="20" height="20" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-full p-1 border border-muted/50 cursor-pointer bg-hint/50 text-muted">
                  <Icon icon="basil:caret-left-solid" width="20" height="20" />
                </button>
                <button className="rounded-full p-1 border border-muted/50 cursor-pointer">
                  <Icon icon="basil:caret-right-solid" width="20" height="20" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6">
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
                onClick={() => console.log("open course")}
              />
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
                onClick={() => console.log("open course")}
              />
            </div>
          </div>
        </div>

        {/* Ai */}
        <div>
          <div>
            <AskAICard />
          </div>
        </div>
      </div>
    </div>
  );
}

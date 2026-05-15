"use client";
import {Icon} from "@mcc/ui";
import BannerCarousel from "./BannerCarousel";
import QuickLinkCard from "./QuickLinkCard";
import {quickLinkCard} from "../constants/QuickLinks";
import LiveClassCard from "./LiveClassCard";

export default function Dashboard() {
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
    </div>
  );
}

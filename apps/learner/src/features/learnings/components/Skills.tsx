"use client";

import CourseCard from "@/src/features/components/CourseCard";
import ScrollRow from "@/src/features/components/RowScroll";
import {demoCourses} from "@/src/features/constants/demoCourses";
import {demoStats} from "../constants/demoHeaderStats";
import LearningsHeader from "./LearningsHeader";

export default function Skills() {
  return (
    <section className="py-6">
      <LearningsHeader
        stats={demoStats}
        title={"Acquire high value skills"}
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
                // onClick={() => console.log("open course")}
              />
            </div>
          ))}
        </ScrollRow>
      </div>

      <div className="pt-16">
        <ScrollRow title="Skills to acquire next">
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
      </div>
    </section>
  );
}

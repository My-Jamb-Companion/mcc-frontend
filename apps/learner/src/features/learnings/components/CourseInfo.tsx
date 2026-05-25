"use client";
import {useState} from "react";
import {Icon} from "@mcc/ui";

type CurriculumItem = {
  id: string;
  title: string;
  description?: string;
  lessons?: string[];
};

type CourseInfoProps = {
  instructor: string;
  title: string;
  description: string;
  curriculum: CurriculumItem[];
  isPaying?: boolean;
};

function AccordionItem({item}: {item: CurriculumItem}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-4 border-b border-muted/20 last:border-none">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-sm font-semibold">{item.title}</span>
        <Icon icon={isOpen ? "ri:close-line" : "ri:add-line"} size={18} />
      </button>

      {isOpen && (item.description || item.lessons?.length) && (
        <div className="mt-2 flex flex-col gap-1">
          {item.description && (
            <p className="text-sm text-subtle">{item.description}</p>
          )}
          {item.lessons?.map((lesson, i) => (
            <p key={i} className="text-sm text-subtle">
              {lesson}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CourseInfo({
  instructor,
  title,
  description,
  curriculum,
  isPaying = false,
}: CourseInfoProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 max-w-[60%]">
        <p className="text-sm text-subtle">
          A course by{" "}
          <span className="font-semibold text-foreground">{instructor}</span>
        </p>
        <h1 className="text-3xl font-bold leading-tight">{title}</h1>
        <p className="text-sm text-subtle leading-relaxed">{description}</p>
      </div>

      {!isPaying && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-subtle">
            Course table of contents
          </p>

          <div className="border border-muted/30 rounded-2xl px-5">
            {curriculum.map((item) => (
              <AccordionItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

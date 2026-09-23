import { CatalogueProgram } from "./types";
import { EnrollButton } from "./EnrollButton";

export const ProgramCard = ({ program }: { program: CatalogueProgram }) => {
  const isFree = !program.price || program.price <= 0;
  const title = [program.exam_name, program.subject_name].filter(Boolean).join(" — ") ||
    "Exam prep program";

  return (
    <div className="rounded-xl border border-muted/20 overflow-hidden flex flex-col bg-background">
      <div className="aspect-video bg-muted/10">
        {program.cover_image_url && (
          <img
            src={program.cover_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-base line-clamp-2">{title}</h3>
        <p className="text-sm text-muted line-clamp-2 flex-1">
          {program.description}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium">
            {isFree ? "Free" : `₦${program.price.toLocaleString()}`}
          </span>
          <EnrollButton
            pending={{
              id: program.program_id,
              title,
              price: program.price,
              image: program.cover_image_url ?? undefined,
              kind: "exam",
            }}
            label={isFree ? "Register free" : "Register"}
          />
        </div>
      </div>
    </div>
  );
};

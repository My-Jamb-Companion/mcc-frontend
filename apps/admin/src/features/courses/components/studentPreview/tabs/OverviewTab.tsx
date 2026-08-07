import {Button, Icon} from "@mcc/ui";
// import Image from "next/image";
import Link from "next/link";

export default function OverviewTab({
  title,
  description,
  rating,
  reviewCount,
  enrolledStudents,
  hours,
  lastUpdated,
  certificate,
  instructor,
  instructorBio,
  instructorAvatar,
  instructorSocial,
  availableLanguage,
  instructorRole,
}: {
  title: string;
  description: string;
  rating: number;
  reviewCount: number;
  enrolledStudents: number;
  hours: number;
  lastUpdated: string;
  certificate: string | undefined;
  instructor: string;
  instructorBio: string;
  instructorAvatar: string;
  instructorSocial: {
    name: string;
    link: string;
  }[];
  availableLanguage: string[];
  instructorRole: string;
}) {
  const handleDownloadCertificate = () => {
    if (!certificate) return;

    const fileName = certificate.split("/").pop() || "certificate";
    const link = document.createElement("a");
    link.href = certificate;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noreferrer noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <section>
      <div className="space-y-4">
        <p className="text-2xl font-semibold">{title}</p>
        <div className="flex items-center gap-2">
          <Icon icon="solar:global-outline" size={14} className="text-muted" />
          <p className="text-xs">{availableLanguage.join(", ")}</p>
        </div>

        <div className="flex items-center gap-12">
          <div>
            <p className="text-sm flex items-center gap-1 font-semibold">
              {rating}
              <Icon
                icon="tabler:star-filled"
                size={14}
                className="text-lime-500"
              />
            </p>
            <p className="text-xs">
              {reviewCount > 1000 ? reviewCount / 1000 + "k" : reviewCount}{" "}
              ratings
            </p>
          </div>

          <div>
            <p className="text-sm flex items-center gap-1 font-semibold">
              {enrolledStudents > 1000
                ? enrolledStudents / 1000 + "k"
                : enrolledStudents}
            </p>
            <p className="text-xs">
              {enrolledStudents > 1 ? "Students" : "Student"}
            </p>
          </div>

          <div>
            <p className="text-sm flex items-center gap-1 font-semibold">
              {hours} {hours > 1 ? "hours" : "hour"}
            </p>
            <p className="text-xs">Total</p>
          </div>
        </div>

        <div className="flex items-center gap-1 py-7.5 border-b border-muted/30 ">
          <Icon
            icon="material-symbols:info-outline-rounded"
            size={14}
            className="text-muted"
          />
          <p className="text-sm">
            Last updated{" "}
            <span className="capitalize">
              {formatMonthYear(lastUpdated) || "Never"}
            </span>
          </p>
        </div>

        <div className="border-b border-muted/40 pb-5">
          <p className="font-medium pb-3">Certificates</p>
          <p className="text-muted text-xs">
            Get the MCC certificate by completeing the entire course
          </p>

          <Button
            variant={!certificate ? "primary" : "secondary"}
            onClick={handleDownloadCertificate}
            width="fit"
            radius="sm"
            disabled={!certificate}
            className={`mt-3 flex! ${certificate ? "" : "bg-[#27272A]/14! cursor-not-allowed!"}`}
            leftIcon={
              <Icon
                icon="line-md:file-download"
                size={16}
                className={`${certificate ? "text-white" : "text-hint"}`}
              />
            }
          >
            MCC Certificate
          </Button>
        </div>

        <div className="border-b border-muted/40 pb-5">
          <p className="font-medium pb-3">Description</p>
          <p className="text-muted text-xs">{description}</p>
        </div>

        <div className="pb-5">
          <p className="font-medium pb-3">Instructor</p>
          <div className="flex items-center gap-2">
            <div className="h-30 w-30 rounded-2xl border border-muted/40 p-1">
              <div className="relative h-full w-full rounded-xl border border-muted/40 overflow-hidden">
                {/* <Image */}
                <img
                  src={instructorAvatar || "/assets/images/pencil.jpg"}
                  alt="instructors avatar"
                  // fill
                  className="object-cover object-top"
                />
              </div>
            </div>
            <div>
              <p className="font-medium text-sm pb-1 capitalize">
                {instructor}
              </p>
              <p className="text-xs capitalize">{instructorRole || ""}</p>

              <div className="flex items-center gap-2 pt-5">
                {instructorSocial.map((i) => {
                  if (i.name == "twitter")
                    return (
                      <Link
                        href={i.link}
                        key={i.name}
                        className="cursor-pointer"
                      >
                        <Icon icon="prime:twitter" size={16} />
                      </Link>
                    );
                  if (i.name == "linkedin")
                    return (
                      <Link
                        href={i.link}
                        key={i.name}
                        className="cursor-pointer"
                      >
                        <Icon icon="line-md:linkedin" size={16} />
                      </Link>
                    );
                  if (i.name == "youtube")
                    return (
                      <Link
                        href={i.link}
                        key={i.name}
                        className="cursor-pointer"
                      >
                        <Icon icon="line-md:youtube" size={16} />
                      </Link>
                    );
                  else
                    return (
                      <Link
                        href={i.link}
                        key={i.name}
                        className="cursor-pointer"
                      >
                        <Icon icon={i.name} size={16} />
                      </Link>
                    );
                })}
              </div>
            </div>
          </div>
          <p className="text-muted text-xs pt-8">{instructorBio}</p>
        </div>
      </div>
    </section>
  );
}

function formatMonthYear(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date
    .toLocaleString("en-US", {month: "long", year: "numeric"})
    .toLowerCase();
}

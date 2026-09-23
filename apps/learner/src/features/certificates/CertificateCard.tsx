"use client";

import {Icon} from "@mcc/ui";
import {useCertificates} from "@/src/features/courses/hooks/useCourses";
import {ApiCertificate} from "@/src/features/courses/services/course.service";

function CertificateRow({certificate}: {certificate: ApiCertificate}) {
  return (
    <div className="flex max-md:flex-col md:items-center gap-6 rounded-[28px] border-2 border-muted/30 md:p-5 p-3  shadow-lg">
      {/* Thumbnail */}
      <div className="h-30 w-30 max-md:w-full shrink-0 overflow-hidden rounded-3xl bg-gray-100">
        <img
          src={certificate.cover_image_url || "/assets/images/tower.jpg"}
          alt={certificate.course_title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 max-md:w-full flex flex-col gap-2">
        <p className="text-xs font-medium text-gray-600">
          Issued {new Date(certificate.issued_at).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>

        <h3 className=" text-xl font-bold text-gray-900">
          {certificate.course_title}
        </h3>

        <div className="flex items-center gap-3">
          <Icon icon="ri:progress-8-line" size={18} color="green" />

          <span className="text-sm font-medium text-gray-900">
            100% Completed
          </span>
        </div>
      </div>

      {/* Share */}
      <button className="flex items-center gap-3 md:self-center font-medium text-gray-900 transition hover:text-black mb-2">
        <Icon icon="ri:share-line" size={20} />
        Share
      </button>
    </div>
  );
}

export default function CertificateCard() {
  const {certificates, isLoading} = useCertificates();

  return (
    <div className="w-full px-4">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Certificates</h2>

      {isLoading ? (
        <p className="text-sm text-muted py-10 text-center">Loading certificates…</p>
      ) : certificates.length === 0 ? (
        <p className="text-sm text-muted py-10 text-center">
          Complete a course to earn your first certificate.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {certificates.map((certificate) => (
            <CertificateRow key={certificate.id} certificate={certificate} />
          ))}
        </div>
      )}
    </div>
  );
}

import {Icon} from "@mcc/ui";
import React from "react";

export default function CertificateCard() {
  return (
    <div className="w-full px-4">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Certificates</h2>

      <div className="flex max-md:flex-col md:items-center gap-6 rounded-[28px] border-2 border-muted/30 md:p-5 p-3  shadow-lg">
        {/* Thumbnail */}
        <div className="h-30 w-30 max-md:w-full shrink-0 overflow-hidden rounded-3xl">
          <img
            src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80"
            alt="Certificate"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 max-md:w-full flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-600">
            Pilates Teacher Training Certification 20 CPD Points
          </p>

          <h3 className=" text-xl font-bold text-gray-900">
            Signed Certificate.
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
    </div>
  );
}

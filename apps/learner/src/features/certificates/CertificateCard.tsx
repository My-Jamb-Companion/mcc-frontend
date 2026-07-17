import {Icon} from "@mcc/ui";
import React from "react";

export default function CertificateCard() {
  return (
    <div className="w-full">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Certificates</h2>

      <div className="flex flex-col items-center gap-6 rounded-[28px] border-2 border-muted/30 p-5 shadow-lg md:flex-row">
        {/* Thumbnail */}
        <div className="h-30 w-30 flex-shrink-0 overflow-hidden rounded-3xl">
          <img
            src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80"
            alt="Certificate"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600">
            Pilates Teacher Training Certification
          </p>

          <p className="mb-5 text-xs text-gray-500">20 CPD Points</p>

          <h3 className="mb-8 text-xl font-bold text-gray-900">
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
        <button className="flex items-center gap-3 self-center font-medium text-gray-900 transition hover:text-black">
          <Icon icon="ri:share-line" size={20} />
          Share
        </button>
      </div>
    </div>
  );
}

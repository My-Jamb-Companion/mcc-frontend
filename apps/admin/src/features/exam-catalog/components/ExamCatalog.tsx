"use client";

import {useState} from "react";
import TabbedButton from "@/src/components/TabbedButton";
import type {CatalogKind} from "../helper/catalog";
import CatalogPanel from "./CatalogPanel";

/** Exam types (JAMB, WAEC…) and subjects that exam programs are filed under. */
export default function ExamCatalog() {
  const [kind, setKind] = useState<CatalogKind>("types");

  return (
    <div className="h-full">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Exams &amp; subjects</h1>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <TabbedButton
            tabs={[
              {key: "types", label: "Exam types", icon: "mdi:bookshelf"},
              {key: "subjects", label: "Subjects", icon: "lucide:book-open"},
            ]}
            active={kind}
            onChange={(key) => setKind(key as CatalogKind)}
          />
        </div>
        <CatalogPanel key={kind} kind={kind} />
      </div>
    </div>
  );
}

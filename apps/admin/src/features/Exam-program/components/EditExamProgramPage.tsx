"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {useEffect} from "react";
import CreateExamProgramForm from "./CreateExamProgram";

/** `/dashboard/exam-program/edit-program?id=<program_id>` -- the create wizard, loaded with an existing program. */
export default function EditExamProgramPage() {
  const id = useSearchParams().get("id");
  const router = useRouter();

  useEffect(() => {
    if (!id) router.replace("/dashboard/exam-program");
  }, [id, router]);

  if (!id) return null;
  return <CreateExamProgramForm key={id} editId={id} />;
}

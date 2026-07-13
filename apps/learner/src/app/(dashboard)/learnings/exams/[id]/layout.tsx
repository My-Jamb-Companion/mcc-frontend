import {ExamProvider} from "@/src/features/learnings/components/exam/context/ExamContext";
import {ReactNode} from "react";

export default function ExamLayout({children}: {children: ReactNode}) {
  return <ExamProvider>{children}</ExamProvider>;
}

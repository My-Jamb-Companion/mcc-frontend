import {Suspense} from "react";
import ReportBug from "@/src/features/feedback/components/ReportBug";

export const metadata = {
  title: "Report a bug",
};

export default function ReportBugPage() {
  // useSearchParams (the page the menu was opened from) needs a Suspense boundary.
  return (
    <Suspense>
      <ReportBug />
    </Suspense>
  );
}

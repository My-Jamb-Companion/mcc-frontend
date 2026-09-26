import {redirect} from "next/navigation";

export default function page() {
  redirect("/dashboard/students/active-students");
}

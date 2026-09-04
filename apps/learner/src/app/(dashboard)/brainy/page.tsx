import {redirect} from "next/navigation";

export const metadata = {
  title: "Brainy",
};

export default function page() {
  redirect("/brainy/new");
}

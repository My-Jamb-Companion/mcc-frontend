import {redirect} from "next/navigation";

// City pricing was removed (docs/pricing-model.md §4, D2/D3 revised) -- tiers
// are picked directly at checkout now. Redirects anyone with the old URL.
export default function page() {
  redirect("/finance/pricing/tiers");
}

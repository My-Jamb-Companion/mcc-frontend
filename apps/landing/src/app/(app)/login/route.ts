import { NextResponse } from "next/server";
import { LEARNER_URL } from "@/src/config";

// The Student Platform owns login; this address only forwards there, so links to /login that were
// published earlier keep working and the page cannot drift from the real one.
export function GET(request: Request) {
  const target = new URL(`${LEARNER_URL.replace(/\/$/, "")}/login`);
  target.search = new URL(request.url).search;
  return NextResponse.redirect(target, 307);
}

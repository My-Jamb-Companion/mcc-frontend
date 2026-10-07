import { NextResponse } from "next/server";
import { LEARNER_URL, PARENT_URL, TEACHER_URL } from "@/src/config";

// Page content links to the other apps as /go/<app>/<path>, e.g. /go/parent/signup. Keeping
// the real addresses here (per environment) means the content an admin edits never has to know them.
const APPS: Record<string, string> = {
  learner: LEARNER_URL,
  parent: PARENT_URL,
  teacher: TEACHER_URL,
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ app: string; path?: string[] }> },
) {
  const { app, path = [] } = await params;
  const base = APPS[app];
  if (!base) return new NextResponse("Not found", { status: 404 });

  const target = new URL(`${base.replace(/\/$/, "")}/${path.map(encodeURIComponent).join("/")}`);
  target.search = new URL(request.url).search;
  return NextResponse.redirect(target, 307);
}

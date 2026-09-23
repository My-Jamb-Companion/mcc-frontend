import Onboarding from "@/src/features/onboarding/components/Onboarding";

// Read via the native Next.js searchParams prop (server-resolved from the
// real request), not the client useSearchParams() hook -- the hook's value
// only exists once the client has a real URL to read, but a static build
// has no request at all (search params resolve empty), so anything that
// branches its render on the CLIENT-computed value synchronously mismatches
// against the server's shell. A plain server-resolved prop has no such gap:
// server and the client's hydration pass see the exact same value.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const preview = params.preview === "true";

  return <Onboarding preview={preview} />;
}

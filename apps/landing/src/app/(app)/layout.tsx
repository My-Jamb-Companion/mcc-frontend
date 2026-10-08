import { AppProviders } from "@/src/providers/AppProvider";

// The pages that sign visitors in or out need the app's providers (session, query client, theme).
// The home page is drawn from content and needs none of it, and /preview must never mount them:
// it runs inside the admin console's frame, where browser storage can be blocked.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}

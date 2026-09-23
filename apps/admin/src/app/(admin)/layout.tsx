"use client";

import BreadcrumbsTopNav from "@/src/components/BreadcrumbsTopNav";
import SideNav from "@/src/components/SideNav";
import {Button, Icon} from "@mcc/ui";
import {useAuth} from "@mcc/features";
import {useThemeStore} from "@mcc/store";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {isAuthenticated, logoutMutation} = useAuth();
  const {theme, toggleTheme} = useThemeStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      // router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => router.replace("/login"),
    });
  };

  // if (!isAuthenticated) return null;

  return (
    <section className="flex flex-col h-screen scrollbar-hide">
      <div
        className="grid max-sm:grid-cols-1 h-full relative overflow-hidden bg-[#F7F7FB]"
        style={{gridTemplateColumns: "auto 1fr"}}
      >
        <SideNav />
        <div className="flex flex-col w-full h-full col-start-2 max-sm:pl-0 p-2 overflow-hidden">
          <div className="relative bg-white border border-muted/20 rounded-3xl h-full flex flex-col overflow-hidden">
            <div className="shrink-0">
              <BreadcrumbsTopNav
                rightSlot={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleTheme}
                      aria-label={
                        theme === "dark"
                          ? "Switch to light mode"
                          : "Switch to dark mode"
                      }
                      title={
                        theme === "dark"
                          ? "Switch to light mode"
                          : "Switch to dark mode"
                      }
                      className="rounded-full p-2 text-foreground transition-colors hover:bg-muted/20"
                    >
                      <Icon
                        icon={
                          theme === "dark"
                            ? "solar:sun-bold-duotone"
                            : "solar:moon-bold"
                        }
                        size={20}
                      />
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      Log out
                    </Button>
                  </div>
                }
              />
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-10 pb-4.5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

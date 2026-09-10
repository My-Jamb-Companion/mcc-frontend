"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@mcc/features";
import { Button } from "@mcc/ui";

const LINKS = [
  { href: "/dashboard", label: "Sessions" },
  { href: "/availability", label: "Availability" },
  { href: "/messages", label: "Messages" },
  { href: "/account", label: "Account" },
];

export const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => router.replace("/login"),
    });
  };

  return (
    <header className="border-b border-muted/20 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span className="font-semibold text-primary">MCC Teacher</span>
        <nav className="flex items-center gap-5">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname.startsWith(link.href)
                  ? "text-primary font-medium"
                  : "text-muted hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <Button variant="ghost" onClick={handleLogout}>
        Log out
      </Button>
    </header>
  );
};

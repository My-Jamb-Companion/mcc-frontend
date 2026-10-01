"use client";

import Link from "next/link";
import { Button } from "@mcc/ui";
import { useCaptureAcquisitionSource } from "@/src/features/enrollment/acquisitionSource";

export default function HomePage() {
  useCaptureAcquisitionSource();

  return (
    <main className="flex-1">
      <section className="px-6 py-20 text-center bg-primary-gradient text-white">
        <h1 className="text-3xl sm:text-5xl font-bold max-w-3xl mx-auto">
          Learn a skill, or ace JAMB &amp; WAEC — your way.
        </h1>
        <p className="mt-4 text-white/90 max-w-xl mx-auto">
          Courses and exam prep, taught by real teachers, backed by an AI tutor
          that actually knows where you're stuck.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/signup">
            <Button variant="primary" size="lg" className="bg-white text-primary hover:bg-white/90">
              Get started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Log in
            </Button>
          </Link>
        </div>
      </section>

      <footer className="px-6 py-10 text-center text-sm text-muted border-t border-muted/20">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </footer>
    </main>
  );
}

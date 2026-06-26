import BrainySideNav from "@/src/features/brainy/components/BrainySideNav";

export default function brianyLayout({children}: {children: React.ReactNode}) {
  return (
    <section className="h-full flex">
      <BrainySideNav />
      {children}
    </section>
  );
}

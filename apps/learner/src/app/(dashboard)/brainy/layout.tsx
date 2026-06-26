import BrainySideNav from "@/src/features/brainy/components/BrainySideNav";
import {BrainyProvider} from "@/src/features/brainy/contexts/BrainyContext";

export default function brianyLayout({children}: {children: React.ReactNode}) {
  return (
    <BrainyProvider>
      <section className="h-full flex w-full">
        <BrainySideNav />
        {children}
      </section>
    </BrainyProvider>
  );
}

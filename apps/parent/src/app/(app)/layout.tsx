import { Header } from "@/src/components/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto px-6 py-6 max-w-4xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}

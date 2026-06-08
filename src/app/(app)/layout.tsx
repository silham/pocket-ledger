import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full max-w-lg mx-auto">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}

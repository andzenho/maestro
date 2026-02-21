import { Sidebar } from "@/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#070d07]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full p-6">{children}</div>
      </main>
    </div>
  );
}

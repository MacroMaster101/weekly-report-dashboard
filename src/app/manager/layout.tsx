import { Navbar } from "@/components/layout/Navbar";
import { ManagerSidebar } from "@/components/layout/ManagerSidebar";
import { AiChatWidget } from "@/components/ai/AiChatWidget";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <ManagerSidebar />
        <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
      <AiChatWidget />
    </div>
  );
}

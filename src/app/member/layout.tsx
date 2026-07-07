import { Navbar } from "@/components/layout/Navbar";
import { MemberSidebar } from "@/components/layout/MemberSidebar";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <MemberSidebar />
        <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

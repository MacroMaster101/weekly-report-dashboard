"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, FileText, FolderKanban, Users, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/manager/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/manager/reports", label: "Reports", Icon: FileText },
  { href: "/manager/projects", label: "Projects", Icon: FolderKanban },
  { href: "/manager/team", label: "Team", Icon: Users },
];

const adminOnlyLinks = [
  { href: "/manager/approvals", label: "Approvals", Icon: UserCheck },
];

export function ManagerSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const visibleLinks = isAdmin ? [...links, ...adminOnlyLinks] : links;
  return (
    <nav className="w-full shrink-0 border-b border-border/50 bg-surface/50 p-2 backdrop-blur-md md:w-64 md:border-b-0 md:border-r md:p-4">
      <p className="hidden px-3 pb-3 pt-1 text-[10px] font-black uppercase tracking-[0.2em] text-faint md:block">
        {isAdmin ? "Admin Hub" : "Manager Hub"}
      </p>
      <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {visibleLinks.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="w-full">
              <Link
                href={href}
                className={cn(
                  "group relative flex min-w-max items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-bold transition-all duration-300 md:gap-3 hover:scale-[1.02] active:scale-[0.98]",
                  active
                    ? "bg-gradient-to-r from-accent to-[#6366f1] text-accent-fg shadow-[0_4px_12px_rgba(99,102,241,0.25)]"
                    : "text-muted hover:bg-surface-2/80 hover:text-fg",
                )}
              >
                <Icon size={16} strokeWidth={2.5} className="transition-transform duration-300 group-hover:scale-110" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}


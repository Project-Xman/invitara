"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { SafeUser } from "~/lib/auth";
import {
  BarChart3,
  Users,
  FileText,
  Palette,
  CreditCard,
  Megaphone,
  Receipt,
  Coins,
  ArrowLeft,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS: readonly { href: string; icon: typeof BarChart3; label: string; exact?: boolean }[] = [
  { href: "/admin", icon: BarChart3, label: "Overview", exact: true },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/invitations", icon: FileText, label: "Invitations" },
  { href: "/admin/templates", icon: Palette, label: "Templates" },
  { href: "/admin/plans", icon: CreditCard, label: "Plans" },
  { href: "/admin/ads", icon: Megaphone, label: "Ads" },
  { href: "/admin/payments", icon: Receipt, label: "Payments" },
  { href: "/admin/credits", icon: Coins, label: "Credits" },
];

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname.startsWith(href);
}

function getBreadcrumb(pathname: string): string {
  const item = NAV_ITEMS.find((n) =>
    n.exact ? pathname === n.href : pathname.startsWith(n.href)
  );
  // Walk backwards through the list so that "/admin" (exact) is matched last
  const matched =
    [...NAV_ITEMS].reverse().find((n) =>
      n.exact ? pathname === n.href : pathname.startsWith(n.href)
    ) ?? item;
  return matched?.label ?? "Overview";
}

export function AdminShell({
  user,
  children,
}: {
  user: SafeUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-6 pt-6 pb-4">
        <Link href="/admin" className="block">
          <span className="font-script text-2xl text-primary">Invitara</span>
        </Link>
        <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`
                group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                transition-colors duration-150
                ${
                  active
                    ? "bg-background/10 text-primary"
                    : "text-background/70 hover:bg-background/5 hover:text-background"
                }
              `}
            >
              <Icon
                className={`h-4.5 w-4.5 flex-shrink-0 ${
                  active ? "text-primary" : "text-background/50 group-hover:text-background/70"
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user area */}
      <div className="border-t border-background/10 px-4 py-4">
        <div className="mb-3 truncate px-2 text-sm text-background/60">
          {user.name}
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-background/70 transition-colors hover:bg-background/5 hover:text-background"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit to Site
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] flex-shrink-0 flex-col bg-foreground text-background lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-foreground text-background
          transition-transform duration-200 ease-in-out lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 rounded-md p-1 text-background/60 hover:text-background"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Admin</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium text-foreground">
                {getBreadcrumb(pathname)}
              </span>
            </div>
          </div>

          {/* Right: admin name */}
          <div className="text-sm text-muted-foreground">{user.name}</div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

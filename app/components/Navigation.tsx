"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { sessionQueryOptions, useLogout } from "~/lib/queries";
import {
  Sparkles,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useQuery(sessionQueryOptions());
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide nav on public invite pages and admin pages (they have their own layout)
  if (pathname.startsWith("/invite/") || pathname.startsWith("/admin")) return null;

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.push("/"),
    });
  };

  const navLinks = [
    { href: "/", l: "Home" },
    { href: "/templates", l: "Templates" },
    { href: "/pricing", l: "Pricing" },
    ...(user
      ? [
          { href: "/dashboard", l: "Dashboard" },
          { href: "/account", l: "Account" },
          ...(user.isAdmin ? [{ href: "/admin", l: "Admin" }] : []),
        ]
      : []),
  ];

  return (
    <nav className="glass-nav fixed left-0 right-0 top-0 z-[100]">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20 transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/30">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-script text-[28px] text-primary">Invitara</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`relative text-[11px] font-semibold uppercase tracking-[2px] transition-colors ${pathname === n.href ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              {n.l}
              {pathname === n.href && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2.5 md:flex">
          {user ? (
            <>
              <div className="credit-badge">
                <Sparkles className="h-3 w-3" /> {user.credits}
              </div>
              <Link href="/editor" className="btn-gold !px-5 !py-2 !text-[10px]">
                Create Invite
              </Link>
              <button
                onClick={handleLogout}
                className="ml-1 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-gold-outline !px-5 !py-2 !text-[10px]">
                Login
              </Link>
              <Link href="/auth/register" className="btn-gold !px-5 !py-2 !text-[10px]">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 py-4 md:hidden">
          <div className="space-y-3">
            {navLinks.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                className={`block text-sm font-medium ${pathname === n.href ? "text-primary" : "text-muted-foreground"}`}
              >
                {n.l}
              </Link>
            ))}
            <div className="border-t border-border pt-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/editor"
                    onClick={() => setMobileOpen(false)}
                    className="btn-gold !px-5 !py-2 !text-[10px] flex-1 text-center"
                  >
                    Create Invite
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn-gold-outline !px-5 !py-2 !text-[10px] flex-1 text-center">
                    Login
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="btn-gold !px-5 !py-2 !text-[10px] flex-1 text-center">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

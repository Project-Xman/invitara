"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { sessionQueryOptions, useLogout } from "~/lib/queries";
import { LogOut, Menu, Sparkles } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useQuery(sessionQueryOptions());
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (
    pathname.startsWith("/invite/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/studio")
  ) {
    return null;
  }

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => router.push("/") });
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
      <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-6 lg:px-8">
        {/* Wordmark */}
        <Link
          href="/"
          className="group relative inline-flex items-center"
          aria-label="Invitara — home"
        >
          <span className="font-script text-[34px] leading-none text-primary transition-all duration-300 group-hover:opacity-90">
            Invitara
          </span>
          <span className="ml-2 hidden h-2 w-2 rounded-full bg-primary/40 transition-all duration-300 group-hover:bg-primary md:inline-block" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-10 md:flex">
          {navLinks.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={
                  "relative font-display italic text-[17px] font-light transition-colors duration-300 " +
                  (active ? "text-foreground" : "text-muted-foreground hover:text-foreground")
                }
              >
                {n.l}
                <span
                  aria-hidden="true"
                  className={
                    "absolute -bottom-2 left-0 right-0 h-px bg-primary transition-all duration-500 " +
                    (active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0")
                  }
                  style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
                />
              </Link>
            );
          })}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <div className="credit-badge">
                <Sparkles className="h-3 w-3" /> {user.credits}
              </div>
              <Link href="/editor" className="btn-primary !px-5 !py-2 !text-[10px]">
                Create
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Sign out"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border/40 text-muted-foreground transition-all hover:border-primary/60 hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="font-display italic text-[15px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link href="/auth/register" className="btn-primary !px-5 !py-2 !text-[10px]">
                Begin
              </Link>
            </>
          )}
        </div>

        {/* Mobile trigger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 transition-colors hover:border-primary/60 md:hidden"
              aria-label="Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[85vw] max-w-sm border-l border-white/[0.06] bg-background p-8"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>

            <div className="flex flex-col gap-8 pt-4">
              <span className="font-script text-5xl text-primary">Invitara</span>

              <nav className="flex flex-col gap-5">
                {navLinks.map((n) => {
                  const active = pathname === n.href;
                  return (
                    <SheetClose asChild key={n.href}>
                      <Link
                        href={n.href}
                        className={
                          "font-display italic text-3xl font-light transition-colors " +
                          (active ? "text-foreground" : "text-muted-foreground hover:text-foreground")
                        }
                      >
                        {n.l}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>

              <div className="hairline" />

              {user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                      Credits
                    </span>
                    <div className="credit-badge">
                      <Sparkles className="h-3 w-3" /> {user.credits}
                    </div>
                  </div>
                  <SheetClose asChild>
                    <Link href="/editor" className="btn-primary w-full justify-center">
                      Create Invite
                    </Link>
                  </SheetClose>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="btn-ghost w-full justify-center"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <SheetClose asChild>
                    <Link href="/auth/login" className="btn-outline-premium w-full justify-center">
                      Sign In
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/auth/register" className="btn-primary w-full justify-center">
                      Begin Your Story
                    </Link>
                  </SheetClose>
                </div>
              )}

              <div className="mt-auto flex items-center justify-between pt-8">
                <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                  Theme
                </span>
                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

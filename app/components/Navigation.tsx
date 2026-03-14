"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { sessionQueryOptions, useLogout } from "~/lib/queries";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useQuery(sessionQueryOptions());
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.push("/"),
    });
  };

  return (
    <nav className="glass-gold fixed left-0 right-0 top-0 z-[100]">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 shadow-gold transition-all group-hover:scale-105 group-hover:shadow-gold-lg">
            <span className="text-sm text-white">✦</span>
          </div>
          <span className="font-script text-[28px] text-gold-700">Invitara</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {[
            { href: "/", l: "Home" },
            { href: "/templates", l: "Templates" },
            { href: "/pricing", l: "Pricing" },
            ...(user
              ? [
                  { href: "/dashboard", l: "Dashboard" },
                  { href: "/account", l: "Account" },
                ]
              : ([] as any)),
          ].map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`relative text-[11px] font-semibold uppercase tracking-[2px] transition-colors ${pathname === n.href ? "text-gold-700" : "text-cream-800/50 hover:text-gold-700"}`}
            >
              {n.l}
              {pathname === n.href && (
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-gold-500" />
              )}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <div className="credit-badge hidden sm:flex">✦ {user.credits}</div>
              <Link href="/editor" className="btn-gold !px-5 !py-2 !text-[10px]">
                Create Invite
              </Link>
              <button onClick={handleLogout} className="ml-2 text-xs opacity-40 hover:opacity-70">
                Logout
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
      </div>
    </nav>
  );
}

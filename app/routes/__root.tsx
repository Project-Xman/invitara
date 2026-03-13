import { createRootRouteWithContext, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { sessionQueryOptions, useLogout } from "~/lib/queries";
import appCss from "~/styles/globals.css?url";

interface Ctx { queryClient: QueryClient }

export const Route = createRootRouteWithContext<Ctx>()({
  head: () => ({
    meta: [{ charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }, { title: "Invitara — Golden Wedding Invitations" }],
    links: [{ rel: "stylesheet", href: appCss }, { rel: "preconnect", href: "https://fonts.googleapis.com" }, { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" }],
  }),
  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const { data: user } = useQuery(sessionQueryOptions());
  const logout = useLogout();

  return <RootDocument>
    <nav className="fixed top-0 left-0 right-0 z-[100] glass-gold">
      <div className="max-w-[1320px] mx-auto flex items-center justify-between px-6 lg:px-8 h-[68px]">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-gold group-hover:shadow-gold-lg transition-all group-hover:scale-105"><span className="text-white text-sm">✦</span></div>
          <span className="font-script text-[28px] text-gold-700">Invitara</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {[{to:"/",l:"Home"},{to:"/templates",l:"Templates"},{to:"/pricing",l:"Pricing"},...(user?[{to:"/dashboard",l:"Dashboard"},{to:"/account",l:"Account"}]:[] as any)].map(n=>
            <Link key={n.to} to={n.to} className={`relative text-[11px] font-semibold tracking-[2px] uppercase transition-colors ${pathname===n.to?"text-gold-700":"text-cream-800/50 hover:text-gold-700"}`}>{n.l}{pathname===n.to&&<span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gold-500 rounded-full"/>}</Link>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {user ? <>
            <div className="credit-badge hidden sm:flex">✦ {user.credits}</div>
            <Link to="/editor" className="btn-gold !py-2 !px-5 !text-[10px]">Create Invite</Link>
            <button onClick={() => logout.mutate()} className="text-xs opacity-40 hover:opacity-70 ml-2">Logout</button>
          </> : <>
            <Link to="/auth/login" className="btn-gold-outline !py-2 !px-5 !text-[10px]">Login</Link>
            <Link to="/auth/register" className="btn-gold !py-2 !px-5 !text-[10px]">Sign Up</Link>
          </>}
        </div>
      </div>
    </nav>
    <Outlet />
    <ReactQueryDevtools buttonPosition="bottom-left" />
  </RootDocument>;
}

function RootDocument({ children }: { children: ReactNode }) {
  return <html lang="en"><head /><body className="font-sans text-cream-900 bg-cream-100 antialiased">{children}</body></html>;
}

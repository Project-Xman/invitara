import { redirect } from "next/navigation";
import { getSession } from "~/lib/actions";
import { AdminShell } from "./AdminShell";

export const metadata = { title: "Invitara Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user || !user.isAdmin) redirect("/");
  return <AdminShell user={user}>{children}</AdminShell>;
}

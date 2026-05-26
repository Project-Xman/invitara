import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '~/lib/actions';

export const metadata: Metadata = {
  title: 'Studio | Invitara',
  description: 'Webstudio — visual design builder',
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user || !user.isAdmin) redirect('/');

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-neutral-950 text-white">
      {children}
    </div>
  );
}

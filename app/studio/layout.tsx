import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '~/lib/actions';

export const metadata: Metadata = {
  title: 'Studio | Invitara',
  description: 'Visual design studio',
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user || !user.isAdmin) redirect('/');

  return (
    <div className="h-screen w-screen overflow-hidden bg-neutral-950 text-white">
      {children}
    </div>
  );
}

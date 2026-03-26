import { WebstudioEmbed } from './_components/WebstudioEmbed';

interface StudioPageProps {
  searchParams: Promise<{ templateId?: string }>;
}

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const webstudioUrl = process.env.WEBSTUDIO_URL ?? null;
  const { templateId } = await searchParams;
  return <WebstudioEmbed webstudioUrl={webstudioUrl} templateId={templateId ?? null} />;
}

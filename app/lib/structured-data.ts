/**
 * JSON-LD structured data builders. Embed via:
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }} />
 */

import { env } from "./env";

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Invitara",
    url: env.APP_URL,
    logo: `${env.APP_URL}/icon.png`,
    sameAs: [],
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Invitara",
    url: env.APP_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${env.APP_URL}/templates?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

interface InviteLdInput {
  groomName: string;
  brideName: string;
  weddingDate?: Date | null;
  venue?: string | null;
  slug: string;
  description?: string | null;
  image?: string;
}

export function invitationLd(i: InviteLdInput) {
  const url = `${env.APP_URL}/invite/${i.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${i.groomName} & ${i.brideName}'s Wedding`,
    startDate: i.weddingDate ? new Date(i.weddingDate).toISOString() : undefined,
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: i.venue
      ? {
          "@type": "Place",
          name: i.venue,
          address: i.venue,
        }
      : undefined,
    image: i.image ?? `${env.APP_URL}/api/og?slug=${i.slug}`,
    description: i.description ?? `Join us in celebrating ${i.groomName} & ${i.brideName}'s wedding`,
    url,
    organizer: {
      "@type": "Person",
      name: `${i.groomName} & ${i.brideName}`,
    },
  };
}

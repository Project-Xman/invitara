export interface TemplateColors {
  primary: string;
  secondary: string;
  bg: string;
  accent: string;
  text: string;
  card: string;
}

export interface WeddingEvent {
  id: number;
  name: string;
  date: string | null;
  venue: string | null;
  time: string | null;
  icon: string;
  color: string;
}

export interface InvitationData {
  groomName: string;
  brideName: string;
  groomFamily?: string | null;
  brideFamily?: string | null;
  blessingFrom?: string | null;
  mantra?: string | null;
  message?: string | null;
  hashtag?: string | null;
  weddingDate?: Date | string | null;
  venue?: string | null;
}

export interface TemplateProps {
  invitation: InvitationData;
  events: WeddingEvent[];
  template: {
    id: string;
    gradient: string;
    colors: TemplateColors;
  };
  fullWidth?: boolean;
}

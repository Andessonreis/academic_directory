
export type EventStatus = "published" | "draft" | "archived" | "confirmed" | "pending" | "canceled";
export type EventCategoryColor = "purple" | "pink" | "blue" | "green" | "orange" | string;

export interface EventItem {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  longDescription: string;

  event_date: string;
  event_time?: string;
  end_date?: string;
  end_time?: string;

  location?: string;
  event_type: 'workshop' | 'palestra' | 'festa' | 'viagem' | 'deadline' | 'social' | string;
  category?: string;

  categoryColor?: EventCategoryColor;

  image_url?: string;
  is_featured: boolean;

  status: EventStatus;

  // Registration
  registration_type?: 'none' | 'external' | 'internal';
  registration_url?: string;
  registration_email_subject?: string;
  registration_email_body?: string;

  tags?: string[]; // course-based audience tags

  // Whether this event has a linked custom page (computed at read time)
  hasCustomPage?: boolean;

  createdAt: string;
  updatedAt?: string;
}
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  email?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityLink {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'whatsapp' | 'discord' | 'telegram' | 'clube' | 'outro';
  category: string; // Ex: "Turma ADS 2023", "Clube de Programação", etc
  icon?: string;
  tags?: string[]; // course-based audience tags
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // Data do evento ou prazo (YYYY-MM-DD)
  endDate?: string; // Data de fim para eventos multi-dia
  weekday?: string; // Dia da semana (pode ser calculado)
  type: "deadline" | "event" | "holiday" | "academic" | string;
  description?: string;
  time?: string;
  location?: string;
  tags?: string[]; // [Superior], [Integrado], [Geral], course names
  isDayOff?: boolean; // dia não letivo (feriado, recesso)
  isSchoolDay?: boolean; // dia letivo (override para sábados etc)
  sourceEventId?: string; // se criado a partir de um evento D.A.
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarCourse {
  id: string;
  name: string;
  pdfUrl: string;
  isActive: boolean;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Course & Level System ───
export type CourseLevel = "superior" | "integrado" | "subsequente" | "pos-graduacao";

export interface Course {
  id: string;
  name: string;
  shortName?: string; // ex: "ADS", "INFO", "EMC"
  level: CourseLevel;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FaqItemDB {
  id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[]; // course tags
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageAttachment {
  name: string;
  url: string;
  size?: number;
  type?: string; // mime type or 'link'
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  description?: string;
  htmlContent: string;
  coverImage?: string;
  eventId?: string;
  attachments: PageAttachment[];
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}


export type EventStatus = "published" | "draft" | "archived" | "confirmed" | "pending" | "canceled";
export type EventCategoryColor = "purple" | "pink" | "blue" | "green" | "orange" | string;

export interface EventItem {
  id: string;
  user_id?: string; // Opcional
  title: string;
  description: string;
  longDescription: string;

  event_date: string; // Data de Início (date)
  event_time?: string; // Hora de Início (time)
  end_date?: string; // Data de Término (date)
  end_time?: string; // Hora de Término (time)

  location?: string;
  event_type: 'workshop' | 'palestra' | 'festa' | 'viagem' | 'deadline' | 'social' | string;
  category?: string;

  categoryColor?: EventCategoryColor;

  image_url?: string;
  is_featured: boolean;

  status: EventStatus;

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
  email?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // Data do evento ou prazo
  weekday?: string; // Dia da semana (pode ser calculado)
  type: "deadline" | "event" | string;
  description?: string;
  time?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type EventStatus = "confirmed" | "pending" | "canceled";
export type EventCategoryColor = "purple" | "pink" | "blue" | "green" | "orange";

export interface EventItem {
  id: number | string;
  title: string;
  date: string; 
  time: string;
  location: string;
  category: string;
  categoryColor: EventCategoryColor;
  description: string;
  longDescription: string;
  image?: string;
  status: EventStatus;
}

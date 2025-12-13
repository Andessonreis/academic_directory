import { supabase } from "@/lib/supabase/client"
import type { EventItem } from "@/types/event"

const dbToUiStatus = (s: string | null | undefined): EventItem["status"] => {
  if (!s) return "confirmed"
  switch (s) {
    case "published":
      return "confirmed"
    case "draft":
      return "pending"
    case "archived":
      return "canceled"
    default:
      return "confirmed"
  }
}

const uiToDbStatus = (s: string | undefined): string => {
  if (!s) return "published"
  switch (s) {
    case "confirmed":
      return "published"
    case "pending":
      return "draft"
    case "canceled":
      return "archived"
    default:
      return s
  }
}

const deriveCategoryColor = (category?: string) => {
  if (!category) return "purple"
  const c = category.toLowerCase()
  if (c.includes("workshop") || c.includes("work")) return "blue"
  if (c.includes("reuni") || c.includes("assembleia") || c.includes("meeting")) return "purple"
  if (c.includes("cine") || c.includes("palestra") || c.includes("pales")) return "pink"
  if (c.includes("esporte") || c.includes("festa") || c.includes("social")) return "orange"
  if (c.includes("acad") || c.includes("curso") || c.includes("workshop")) return "green"
  return "purple"
}

const formatDateDisplay = (d: string | null | undefined) => {
  if (!d) return ""
  const dt = new Date(d)
  try {
    return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return String(d)
  }
}

const formatTimeDisplay = (start: string | null | undefined, end: string | null | undefined) => {
  if (!start) return ""
  if (!end) return start
  return `${start} - ${end}`
}

export interface CreateEventInput {
  title: string
  description?: string
  longDescription?: string
  eventDate?: string // Data início
  endDate?: string | null // Data término
  startTime?: string
  endTime?: string
  location?: string
  category?: string
  image?: string
  status?: EventItem["status"]
}

export async function getEvents(): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar eventos:", error)
    return []
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    longDescription: row.long_description || row.description || "",
    date: formatDateDisplay(row.event_date),
    time: formatTimeDisplay(row.event_time, row.end_time),
    location: row.location,
    category: row.category,
    categoryColor: deriveCategoryColor(row.category),
    image: row.image_url || null,
    image_url: row.image_url || null,
    status: dbToUiStatus(row.status),
    event_date: row.event_date,
    event_time: row.event_time,
    end_date: row.end_date,
    end_time: row.end_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function createEvent(payload: CreateEventInput) {
  const today = new Date().toISOString().split("T")[0]

  const insertRow: any = {
    title: payload.title,
    description: payload.description || null,
    long_description: payload.longDescription || payload.description || null,
    event_date: payload.eventDate || today, // default to today
    event_time: payload.startTime || null,
    end_date: payload.endDate || null, // separate end_date field
    end_time: payload.endTime || null,
    location: payload.location || null,
    category: payload.category || null,
    image_url: payload.image || null,
    status: uiToDbStatus(payload.status),
  }

  const { data, error } = await supabase.from("events").insert(insertRow).select().single()

  if (error) {
    console.error("createEvent error:", error)
    throw error
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    longDescription: data.long_description,
    date: formatDateDisplay(data.event_date),
    time: formatTimeDisplay(data.event_time, data.end_time),
    location: data.location,
    category: data.category,
    categoryColor: deriveCategoryColor(data.category),
    image: data.image_url,
    image_url: data.image_url,
    status: dbToUiStatus(data.status),
    event_date: data.event_date,
    event_time: data.event_time,
    end_date: data.end_date,
    end_time: data.end_time,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function updateEvent(id: string, payload: Partial<CreateEventInput>) {
  const updateRow: any = {}

  if (payload.title !== undefined) updateRow.title = payload.title
  if (payload.description !== undefined) updateRow.description = payload.description
  if (payload.longDescription !== undefined) updateRow.long_description = payload.longDescription
  if (payload.eventDate !== undefined) updateRow.event_date = payload.eventDate
  if (payload.endDate !== undefined) updateRow.end_date = payload.endDate // handle end_date
  if (payload.startTime !== undefined) updateRow.event_time = payload.startTime
  if (payload.endTime !== undefined) updateRow.end_time = payload.endTime
  if (payload.location !== undefined) updateRow.location = payload.location
  if (payload.category !== undefined) updateRow.category = payload.category
  if (payload.image !== undefined) updateRow.image_url = payload.image
  if (payload.status !== undefined) updateRow.status = uiToDbStatus(payload.status)

  updateRow.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from("events").update(updateRow).eq("id", id).select().single()

  if (error) {
    console.error("updateEvent error:", error)
    throw error
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    longDescription: data.long_description,
    date: formatDateDisplay(data.event_date),
    time: formatTimeDisplay(data.event_time, data.end_time),
    location: data.location,
    category: data.category,
    categoryColor: deriveCategoryColor(data.category),
    image: data.image_url,
    image_url: data.image_url,
    status: dbToUiStatus(data.status),
    event_date: data.event_date,
    event_time: data.event_time,
    end_date: data.end_date,
    end_time: data.end_time,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id)

  if (error) {
    console.error("deleteEvent error:", error)
    throw error
  }
}

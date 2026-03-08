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

function mapEventRow(row: any): EventItem {
  return {
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
    is_featured: row.is_featured ?? false,
    event_type: row.event_type ?? "",
    registration_type: row.registration_type ?? "none",
    registration_url: row.registration_url ?? undefined,
    registration_email_subject: row.registration_email_subject ?? undefined,
    registration_email_body: row.registration_email_body ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    hasCustomPage: false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as EventItem
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
  eventDate?: string
  endDate?: string | null
  startTime?: string
  endTime?: string
  location?: string
  category?: string
  image?: string
  status?: EventItem["status"]
  registrationType?: 'none' | 'external' | 'internal'
  registrationUrl?: string
  registrationEmailSubject?: string
  registrationEmailBody?: string
  tags?: string[]
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

  const events = (data || []).map((row: any) => mapEventRow(row))

  // Check which events have linked custom pages
  try {
    const eventIds = events.map((e: EventItem) => e.id)
    if (eventIds.length > 0) {
      const { data: pages } = await supabase
        .from("custom_pages")
        .select("event_id")
        .in("event_id", eventIds)
        .eq("is_published", true)
      const linkedIds = new Set((pages ?? []).map((p: any) => p.event_id))
      for (const evt of events) {
        evt.hasCustomPage = linkedIds.has(evt.id)
      }
    }
  } catch { /* table might not exist yet */ }

  return events
}

export async function getEventById(id: string): Promise<EventItem | null> {
  const { data: row, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !row) {
    console.error("Erro ao buscar evento:", error?.message)
    return null
  }

  return mapEventRow(row)
}

export async function createEvent(payload: CreateEventInput) {
  const today = new Date().toISOString().split("T")[0]

  const baseRow: any = {
    title: payload.title,
    description: payload.description || null,
    long_description: payload.longDescription || payload.description || null,
    event_date: payload.eventDate || today,
    event_time: payload.startTime || null,
    end_date: payload.endDate || null,
    end_time: payload.endTime || null,
    location: payload.location || null,
    category: payload.category || null,
    image_url: payload.image || null,
    status: uiToDbStatus(payload.status),
    tags: payload.tags || [],
  }

  const regFields: any = {
    registration_type: payload.registrationType || "none",
    registration_url: payload.registrationUrl || null,
    registration_email_subject: payload.registrationEmailSubject || null,
    registration_email_body: payload.registrationEmailBody || null,
  }

  // Try with registration fields first; fall back without them if columns don't exist yet
  let { data, error } = await supabase.from("events").insert({ ...baseRow, ...regFields }).select().single()

  if (error) {
    const { data: d2, error: e2 } = await supabase.from("events").insert(baseRow).select().single()
    if (e2) {
      console.error("createEvent error:", e2)
      throw e2
    }
    data = d2
  }

  return mapEventRow(data)
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
  if (payload.tags !== undefined) updateRow.tags = payload.tags
  // Registration fields — split so we can fall back if columns don't exist
  const regKeys: Record<string, any> = {}
  if (payload.registrationType !== undefined) regKeys.registration_type = payload.registrationType
  if (payload.registrationUrl !== undefined) regKeys.registration_url = payload.registrationUrl
  if (payload.registrationEmailSubject !== undefined) regKeys.registration_email_subject = payload.registrationEmailSubject
  if (payload.registrationEmailBody !== undefined) regKeys.registration_email_body = payload.registrationEmailBody

  updateRow.updated_at = new Date().toISOString()

  let { data, error } = await supabase.from("events").update({ ...updateRow, ...regKeys }).eq("id", id).select().single()

  if (error && Object.keys(regKeys).length > 0) {
    const { data: d2, error: e2 } = await supabase.from("events").update(updateRow).eq("id", id).select().single()
    if (e2) {
      console.error("updateEvent error:", e2)
      throw e2
    }
    data = d2
  } else if (error) {
    console.error("updateEvent error:", error)
    throw error
  }

  return mapEventRow(data)
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id)

  if (error) {
    console.error("deleteEvent error:", error)
    throw error
  }
}

import { createBrowserClient } from "@supabase/ssr"
import type { CalendarEvent } from "@/types/event"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase.from("calendar_events").select("*").order("date", { ascending: true })

  if (error) {
    console.error("Erro ao buscar eventos do calendário:", error)
    return []
  }

  return data.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    weekday: event.weekday,
    type: event.type,
    description: event.description,
    time: event.time,
    location: event.location,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  }))
}

export async function createCalendarEvent(event: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">) {
  const { data, error } = await supabase
    .from("calendar_events")
    .insert([
      {
        title: event.title,
        date: event.date,
        weekday: event.weekday,
        type: event.type,
        description: event.description,
        time: event.time,
        location: event.location,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCalendarEvent(id: string, event: Partial<CalendarEvent>) {
  const updateData: any = { updated_at: new Date().toISOString() }

  if (event.title) updateData.title = event.title
  if (event.date) updateData.date = event.date
  if (event.weekday) updateData.weekday = event.weekday
  if (event.type) updateData.type = event.type
  if (event.description) updateData.description = event.description
  if (event.time !== undefined) updateData.time = event.time
  if (event.location !== undefined) updateData.location = event.location

  const { data, error } = await supabase.from("calendar_events").update(updateData).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteCalendarEvent(id: string) {
  const { error } = await supabase.from("calendar_events").delete().eq("id", id)

  if (error) throw error
}

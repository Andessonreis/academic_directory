import { createBrowserClient } from "@supabase/ssr"
import type { CalendarCourse, CalendarEvent } from "@/types/event"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .neq("type", "semester")
    .neq("title", "__SEMESTER_CONFIG__")
    .order("date", { ascending: true })

  if (error) {
    console.error("Erro ao buscar eventos do calendário:", error)
    return []
  }

  return data.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    endDate: event.end_date ?? undefined,
    weekday: event.weekday,
    type: event.type,
    description: event.description,
    time: event.time,
    location: event.location,
    tags: event.tags ?? [],
    isDayOff: event.is_day_off ?? undefined,
    isSchoolDay: event.is_school_day ?? undefined,
    sourceEventId: event.source_event_id ?? undefined,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  }) as CalendarEvent)
}

export async function getCalendarCourses(): Promise<CalendarCourse[]> {
  const { data, error } = await supabase
    .from("calendar_courses")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    console.error("Erro ao buscar cursos do calendário:", error)
    return []
  }

  return (data || []).map((course) => ({
    id: course.id,
    name: course.name,
    pdfUrl: course.pdf_url,
    isActive: course.is_active,
    isDefault: course.is_default,
    createdAt: course.created_at,
    updatedAt: course.updated_at,
  }))
}

export async function createCalendarCourse(course: Omit<CalendarCourse, "id" | "createdAt" | "updatedAt">) {
  const { data, error } = await supabase
    .from("calendar_courses")
    .insert([
      {
        name: course.name,
        pdf_url: course.pdfUrl,
        is_active: course.isActive ?? true,
        is_default: course.isDefault ?? false,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCalendarCourse(id: string, course: Partial<CalendarCourse>) {
  const updateData: any = { updated_at: new Date().toISOString() }

  if (course.name !== undefined) updateData.name = course.name
  if (course.pdfUrl !== undefined) updateData.pdf_url = course.pdfUrl
  if (course.isActive !== undefined) updateData.is_active = course.isActive
  if (course.isDefault !== undefined) updateData.is_default = course.isDefault

  const { data, error } = await supabase.from("calendar_courses").update(updateData).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteCalendarCourse(id: string) {
  const { error } = await supabase.from("calendar_courses").delete().eq("id", id)

  if (error) throw error
}

export async function createCalendarEvent(event: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">) {
  // Try with all new columns first; fallback to basic columns if migration hasn't run
  const fullPayload = {
    title: event.title,
    date: event.date,
    end_date: event.endDate || null,
    weekday: event.weekday,
    type: event.type,
    description: event.description,
    time: event.time,
    location: event.location,
    tags: event.tags || [],
    is_day_off: event.isDayOff ?? null,
    is_school_day: event.isSchoolDay ?? null,
    source_event_id: event.sourceEventId || null,
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .insert([fullPayload])
    .select()
    .single()

  if (error) {
    // Fallback: try without new columns (migration not yet applied)
    const basicPayload = {
      title: event.title,
      date: event.date,
      weekday: event.weekday,
      type: event.type,
      description: event.description,
      time: event.time,
      location: event.location,
    }
    const { data: d2, error: e2 } = await supabase
      .from("calendar_events")
      .insert([basicPayload])
      .select()
      .single()
    if (e2) throw e2
    return d2
  }
  return data
}

export async function updateCalendarEvent(id: string, event: Partial<CalendarEvent>) {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (event.title !== undefined) updateData.title = event.title
  if (event.date !== undefined) updateData.date = event.date
  if (event.endDate !== undefined) updateData.end_date = event.endDate || null
  if (event.weekday !== undefined) updateData.weekday = event.weekday
  if (event.type !== undefined) updateData.type = event.type
  if (event.description !== undefined) updateData.description = event.description
  if (event.time !== undefined) updateData.time = event.time
  if (event.location !== undefined) updateData.location = event.location
  if (event.tags !== undefined) updateData.tags = event.tags
  if (event.isDayOff !== undefined) updateData.is_day_off = event.isDayOff
  if (event.isSchoolDay !== undefined) updateData.is_school_day = event.isSchoolDay

  const { data, error } = await supabase.from("calendar_events").update(updateData).eq("id", id).select().single()

  if (error) {
    // Fallback: try with only basic columns
    const basicUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (event.title !== undefined) basicUpdate.title = event.title
    if (event.date !== undefined) basicUpdate.date = event.date
    if (event.weekday !== undefined) basicUpdate.weekday = event.weekday
    if (event.type !== undefined) basicUpdate.type = event.type
    if (event.description !== undefined) basicUpdate.description = event.description
    if (event.time !== undefined) basicUpdate.time = event.time
    if (event.location !== undefined) basicUpdate.location = event.location

    const { data: d2, error: e2 } = await supabase.from("calendar_events").update(basicUpdate).eq("id", id).select().single()
    if (e2) throw e2
    return d2
  }
  return data
}

export async function deleteCalendarEvent(id: string) {
  const { error } = await supabase.from("calendar_events").delete().eq("id", id)

  if (error) throw error
}

/* ─── Semester config ─── */

const SEMESTER_TITLE = "__SEMESTER_CONFIG__"

export async function getSemesterConfig(): Promise<CalendarEvent | null> {
  try {
    // Try "semester" type first, then fallback to title marker
    let { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("type", "semester")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      // Fallback: look by title marker
      const res = await supabase
        .from("calendar_events")
        .select("*")
        .eq("title", SEMESTER_TITLE)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      data = res.data
    }

    if (!data) return null

    return {
      id: data.id,
      title: data.title,
      date: data.date,
      endDate: data.end_date ?? (data.description?.startsWith("end:") ? data.description.slice(4) : undefined),
      weekday: data.weekday,
      type: data.type,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as CalendarEvent
  } catch {
    return null
  }
}

export async function saveSemesterConfig(startDate: string, endDate: string) {
  const existing = await getSemesterConfig()

  if (existing) {
    // Try with end_date column first
    const { error } = await supabase
      .from("calendar_events")
      .update({ date: startDate, end_date: endDate, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
    if (error) {
      // Fallback: store endDate in description
      const { error: e2 } = await supabase
        .from("calendar_events")
        .update({ date: startDate, description: `end:${endDate}`, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
      if (e2) throw new Error(`Falha ao atualizar o período: ${e2.message || JSON.stringify(e2)}`)
    }
  } else {
    // Try inserting with type "semester"
    const { error } = await supabase.from("calendar_events").insert([{
      title: SEMESTER_TITLE,
      date: startDate,
      end_date: endDate,
      type: "semester",
      weekday: "",
      description: "",
    }])
    if (error) {
      // Fallback: use type "academic" with the marker title (type may be enum-constrained)
      const { error: e2 } = await supabase.from("calendar_events").insert([{
        title: SEMESTER_TITLE,
        date: startDate,
        end_date: endDate,
        type: "academic",
        weekday: "",
        description: `end:${endDate}`,
      }])
      if (e2) {
        // Last try: no end_date column either
        const { error: e3 } = await supabase.from("calendar_events").insert([{
          title: SEMESTER_TITLE,
          date: startDate,
          type: "academic",
          weekday: "",
          description: `end:${endDate}`,
        }])
        if (e3) throw new Error(`Falha ao criar o período: ${e3.message || JSON.stringify(e3)}`)
      }
    }
  }
}

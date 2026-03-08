import { createBrowserClient } from "@supabase/ssr"
import type { Course, CourseLevel } from "@/types/event"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("level")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Erro ao buscar cursos:", error)
    return []
  }

  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    shortName: c.short_name,
    level: c.level as CourseLevel,
    isActive: c.is_active,
    displayOrder: c.display_order ?? 0,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }))
}

export async function getActiveCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .order("level")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Erro ao buscar cursos ativos:", error)
    return []
  }

  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    shortName: c.short_name,
    level: c.level as CourseLevel,
    isActive: c.is_active,
    displayOrder: c.display_order ?? 0,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }))
}

export async function createCourse(
  course: Omit<Course, "id" | "createdAt" | "updatedAt">
) {
  const { data, error } = await supabase
    .from("courses")
    .insert([
      {
        name: course.name,
        short_name: course.shortName || null,
        level: course.level,
        is_active: course.isActive ?? true,
        display_order: course.displayOrder ?? 0,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCourse(id: string, course: Partial<Course>) {
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (course.name !== undefined) updateData.name = course.name
  if (course.shortName !== undefined) updateData.short_name = course.shortName
  if (course.level !== undefined) updateData.level = course.level
  if (course.isActive !== undefined) updateData.is_active = course.isActive
  if (course.displayOrder !== undefined) updateData.display_order = course.displayOrder

  const { data, error } = await supabase
    .from("courses")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCourse(id: string) {
  const { error } = await supabase.from("courses").delete().eq("id", id)
  if (error) throw error
}

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  superior: "Superior",
  integrado: "Integrado",
  subsequente: "Subsequente",
  "pos-graduacao": "Pós-Graduação",
}

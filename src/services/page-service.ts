import { supabase } from "@/lib/supabase/client"
import type { CustomPage, PageAttachment } from "@/types/event"

const TABLE = "custom_pages"

function mapRow(row: Record<string, unknown>): CustomPage {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    description: (row.description as string) ?? undefined,
    htmlContent: (row.html_content as string) ?? "",
    coverImage: (row.cover_image as string) ?? undefined,
    eventId: (row.event_id as string) ?? undefined,
    attachments: (Array.isArray(row.attachments) ? row.attachments : []) as PageAttachment[],
    isPublished: (row.is_published as boolean) ?? false,
    createdAt: row.created_at as string | undefined,
    updatedAt: row.updated_at as string | undefined,
  }
}

function toRow(item: Partial<CustomPage>) {
  const row: Record<string, unknown> = {}
  if (item.slug !== undefined) row.slug = item.slug
  if (item.title !== undefined) row.title = item.title
  if (item.description !== undefined) row.description = item.description
  if (item.htmlContent !== undefined) row.html_content = item.htmlContent
  if (item.coverImage !== undefined) row.cover_image = item.coverImage
  if (item.eventId !== undefined) row.event_id = item.eventId
  if (item.attachments !== undefined) row.attachments = item.attachments
  if (item.isPublished !== undefined) row.is_published = item.isPublished
  return row
}

export async function getPublishedPages(): Promise<CustomPage[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[page-service] getPublishedPages:", error.message)
    return []
  }
  return (data ?? []).map(mapRow)
}

export async function getPageBySlug(slug: string): Promise<CustomPage | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (error) {
    console.error("[page-service] getPageBySlug:", error.message)
    return null
  }
  return mapRow(data)
}

export async function getAllPages(): Promise<CustomPage[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[page-service] getAllPages:", error.message)
    return []
  }
  return (data ?? []).map(mapRow)
}

export async function createPage(item: Omit<CustomPage, "id" | "createdAt" | "updatedAt">): Promise<CustomPage | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(toRow(item))
    .select()
    .single()

  if (error) {
    console.error("[page-service] createPage:", error.message)
    return null
  }
  return mapRow(data)
}

export async function updatePage(id: string, changes: Partial<CustomPage>): Promise<CustomPage | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...toRow(changes), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[page-service] updatePage:", error.message)
    return null
  }
  return mapRow(data)
}

export async function deletePage(id: string): Promise<boolean> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id)
  if (error) {
    console.error("[page-service] deletePage:", error.message)
    return false
  }
  return true
}

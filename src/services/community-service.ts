import { createBrowserClient } from "@supabase/ssr"
import type { CommunityLink } from "@/types/event"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const normalizeOptionalString = (value: string | null | undefined): string | null => {
  if (value === undefined || value === null || value.trim() === "") {
    return null
  }
  return value
}

export async function getCommunityLinks(): Promise<CommunityLink[]> {
  const { data, error } = await supabase
    .from("community_links")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Failed to fetch community links:", error)
    return []
  }

  return data.map((link) => ({
    id: link.id,
    title: link.title,
    description: link.description,
    url: link.url,
    type: link.type,
    category: link.category,
    icon: link.icon,
    isActive: link.is_active,
    displayOrder: link.display_order,
    createdAt: link.created_at,
    updatedAt: link.updated_at,
  }))
}

export async function getAllCommunityLinks(): Promise<CommunityLink[]> {
  const { data, error } = await supabase
    .from("community_links")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Failed to fetch all community links:", error)
    return []
  }

  return data.map((link) => ({
    id: link.id,
    title: link.title,
    description: link.description,
    url: link.url,
    type: link.type,
    category: link.category,
    icon: link.icon,
    isActive: link.is_active,
    displayOrder: link.display_order,
    createdAt: link.created_at,
    updatedAt: link.updated_at,
  }))
}

export async function createCommunityLink(
  link: Omit<CommunityLink, "id" | "createdAt" | "updatedAt">
) {
  const normalizedDescription = normalizeOptionalString(link.description)
  const normalizedIcon = normalizeOptionalString(link.icon)

  const { data, error } = await supabase
    .from("community_links")
    .insert([
      {
        title: link.title,
        description: normalizedDescription,
        url: link.url,
        type: link.type,
        category: link.category,
        icon: normalizedIcon,
        is_active: link.isActive !== undefined ? link.isActive : true,
        display_order: link.displayOrder || 0,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCommunityLink(id: string, link: Partial<CommunityLink>) {
  const updateData: any = {}

  if (link.title !== undefined) updateData.title = link.title
  if (link.description !== undefined) updateData.description = normalizeOptionalString(link.description)
  if (link.url !== undefined) updateData.url = link.url
  if (link.type !== undefined) updateData.type = link.type
  if (link.category !== undefined) updateData.category = link.category
  if (link.icon !== undefined) updateData.icon = normalizeOptionalString(link.icon)
  if (link.isActive !== undefined) updateData.is_active = link.isActive
  if (link.displayOrder !== undefined) updateData.display_order = link.displayOrder

  updateData.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from("community_links")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCommunityLink(id: string) {
  const { error } = await supabase.from("community_links").delete().eq("id", id)

  if (error) throw error
}

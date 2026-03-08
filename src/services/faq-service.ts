import { supabase } from "@/lib/supabase/client"
import type { FaqItemDB } from "@/types/event"

const TABLE = "faqs"

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapRow(row: Record<string, unknown>): FaqItemDB {
  return {
    id: row.id as string,
    question: row.question as string,
    answer: row.answer as string,
    category: (row.category as string) ?? undefined,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    displayOrder: (row.display_order as number) ?? 0,
    isActive: (row.is_active as boolean) ?? true,
    createdAt: row.created_at as string | undefined,
    updatedAt: row.updated_at as string | undefined,
  }
}

function toRow(item: Partial<FaqItemDB>) {
  const row: Record<string, unknown> = {}
  if (item.question !== undefined) row.question = item.question
  if (item.answer !== undefined) row.answer = item.answer
  if (item.category !== undefined) row.category = item.category
  if (item.tags !== undefined) row.tags = item.tags
  if (item.displayOrder !== undefined) row.display_order = item.displayOrder
  if (item.isActive !== undefined) row.is_active = item.isActive
  return row
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function getFaqs(): Promise<FaqItemDB[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("[faq-service] getFaqs:", error.message)
    return []
  }
  return (data ?? []).map(mapRow)
}

export async function getAllFaqs(): Promise<FaqItemDB[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("[faq-service] getAllFaqs:", error.message)
    return []
  }
  return (data ?? []).map(mapRow)
}

export async function createFaq(item: Omit<FaqItemDB, "id" | "createdAt" | "updatedAt">): Promise<FaqItemDB | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(toRow(item))
    .select()
    .single()

  if (error) {
    console.error("[faq-service] createFaq:", error.message)
    return null
  }
  return mapRow(data)
}

export async function updateFaq(id: string, changes: Partial<FaqItemDB>): Promise<FaqItemDB | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...toRow(changes), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[faq-service] updateFaq:", error.message)
    return null
  }
  return mapRow(data)
}

export async function deleteFaq(id: string): Promise<boolean> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id)
  if (error) {
    console.error("[faq-service] deleteFaq:", error.message)
    return false
  }
  return true
}

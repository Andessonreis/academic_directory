import { createBrowserClient } from "@supabase/ssr"
import type { TeamMember } from "@/types/event"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

/**
 * Normaliza o valor de uma string opcional (como links ou bio) para garantir
 * que strings vazias sejam tratadas como null, limpando o campo no banco.
 * @param value O valor da string (pode ser string, undefined ou null).
 * @returns O valor limpo ou null.
 */
const normalizeOptionalString = (value: string | null | undefined): string | null => {
  if (value === undefined || value === null || value.trim() === "") {
    return null
  }
  return value
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Erro ao buscar membros do time:", error)
    return []
  }

  const mapped = data.map((member) => ({
    id: member.id,
    name: member.name,
    role: member.role,
    bio: member.bio,
    image: member.image_url,
    linkedin: member.linkedin_url,
    github: member.github_url,
    email: member.email,
    isActive: member.is_active,
    displayOrder: member.display_order,
    createdAt: member.created_at,
    updatedAt: member.updated_at,
  }))

  console.log("[v0] Dados mapeados:", mapped)
  return mapped
}

export async function createTeamMember(member: Omit<TeamMember, "id" | "createdAt" | "updatedAt">) {
  // Aplica a normalização para converter strings vazias em NULL
  const normalizedBio = normalizeOptionalString(member.bio)
  const normalizedImage = normalizeOptionalString(member.image)
  const normalizedLinkedin = normalizeOptionalString(member.linkedin)
  const normalizedGithub = normalizeOptionalString(member.github)
  const normalizedEmail = normalizeOptionalString(member.email)

  const { data, error } = await supabase
    .from("team_members")
    .insert([
      {
        name: member.name,
        role: member.role,
        bio: normalizedBio,
        // CORRIGIDO: Usa os nomes das colunas do DB (snake_case) na inserção
        image_url: normalizedImage,
        linkedin_url: normalizedLinkedin,
        github_url: normalizedGithub,
        email: normalizedEmail,
        is_active: member.isActive !== undefined ? member.isActive : true,
        display_order: member.displayOrder || 0,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTeamMember(id: string, member: Partial<TeamMember>) {
  const updateData: any = {}

  if (member.name) updateData.name = member.name
  if (member.role) updateData.role = member.role

  // CORRIGIDO: Usa a nomenclatura do DB (snake_case) nas chaves do objeto de atualização
  if (member.bio !== undefined) updateData.bio = normalizeOptionalString(member.bio)
  if (member.image !== undefined) updateData.image_url = normalizeOptionalString(member.image)

  if (member.linkedin !== undefined) updateData.linkedin_url = normalizeOptionalString(member.linkedin)
  if (member.github !== undefined) updateData.github_url = normalizeOptionalString(member.github)
  if (member.email !== undefined) updateData.email = normalizeOptionalString(member.email)

  if (member.isActive !== undefined) updateData.is_active = member.isActive
  if (member.displayOrder !== undefined) updateData.display_order = member.displayOrder

  updateData.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from("team_members").update(updateData).eq("id", id).select().single()

  if (error) throw error
  return data
}

export async function deleteTeamMember(id: string) {
  const { error } = await supabase.from("team_members").delete().eq("id", id)

  if (error) throw error
}

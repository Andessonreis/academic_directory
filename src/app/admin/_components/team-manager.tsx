"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Loader2, Mail, Github, Linkedin, Users, ImageIcon, GripVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createTeamMember, updateTeamMember, deleteTeamMember } from "@/services/team-service"
import { supabase } from "@/lib/supabase/client"
import type { TeamMember } from "@/types/event"

const STORAGE_BUCKET = "uploads"

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

const buildLinkedinUrl = (value: string) => {
  if (!value) return ""
  return value.startsWith("http") ? value : `https://linkedin.com/in/${value}`
}

const buildGithubUrl = (value: string) => {
  if (!value) return ""
  return value.startsWith("http") ? value : `https://github.com/${value}`
}

const buildInstagramUrl = (value: string) => {
  if (!value) return ""
  return value.startsWith("http") ? value : `https://instagram.com/${value}`
}

function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    image: "",
    linkedin: "",
    github: "",
    instagram: "",
    email: "",
    isActive: true,
    displayOrder: 0,
  })

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    setLoading(true)
    const { data } = await supabase.from("team_members").select("*").order("display_order")
    if (data) {
      const mapped = data.map((m: any) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        bio: m.bio,
        image: m.image_url,
        linkedin: m.linkedin_url,
        github: m.github_url,
        email: m.email,
        isActive: m.is_active,
        displayOrder: m.display_order,
      }))

      setMembers(mapped)
    }
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `team/images/${fileName}`

    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file)

    if (uploadError) {
      alert("Erro ao fazer upload da imagem: " + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)

    setFormData((prev) => {
      const newData = { ...prev, image: data.publicUrl }
      return newData
    })
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingMember) {
        await updateTeamMember(editingMember.id, formData)
      } else {
        await createTeamMember(formData)
      }
      setIsDialogOpen(false)
      resetForm()
      await loadMembers()
    } catch (error) {
      console.error("[v0] Erro ao salvar membro:", error)
      alert("Erro ao salvar membro")
    }
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio || "",
      image: member.image || "",
      linkedin: member.linkedin || "",
      github: member.github || "",
      instagram: member.instagram || "",
      email: member.email || "",
      isActive: member.isActive,
      displayOrder: member.displayOrder,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este membro?")) return
    try {
      await deleteTeamMember(id)
      loadMembers()
    } catch (error) {
      console.error("Erro ao deletar membro:", error)
      alert("Erro ao deletar membro")
    }
  }

  const resetForm = () => {
    setEditingMember(null)
    setFormData({
      name: "",
      role: "",
      bio: "",
      image: "",
      linkedin: "",
      github: "",
      instagram: "",
      email: "",
      isActive: true,
      displayOrder: 0,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciar Time</h2>
          <p className="mt-1 text-sm text-white/35">
            Visual mais compacto para organizar muitos membros sem poluir a tela.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/45">
            {members.length} membros
          </span>
          <Button
            onClick={() => {
              resetForm()
              setIsDialogOpen(true)
            }}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="mr-2" size={18} />
            Novo Membro
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
              <Users size={16} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/25">Total</p>
              <p className="text-lg font-semibold text-white">{members.length}</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-white/25">Ativos</p>
          <p className="mt-2 text-lg font-semibold text-white">{members.filter((member) => member.isActive).length}</p>
        </Card>

        <Card className="border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-white/25">Ordem</p>
          <p className="mt-2 text-sm text-white/45">Lista densa e vertical para escalar melhor.</p>
        </Card>
      </div>

      <Card className="overflow-hidden border-white/10 bg-[#0b0b0b]">
        <div className="flex flex-col gap-3 border-b border-white/6 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs uppercase tracking-[0.25em] text-white/25">Membros cadastrados</div>
          <div className="hidden text-xs text-white/25 md:block">Lista otimizada para leitura rápida e crescimento da equipe.</div>
        </div>

        <div className="divide-y divide-white/6">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-4 px-4 py-4 transition hover:bg-white/[0.02] lg:flex-row lg:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="hidden text-white/15 lg:block">
                  <GripVertical size={16} />
                </div>

                {member.image ? (
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="h-14 w-14 rounded-xl object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.04] text-sm font-semibold text-white/60 ring-1 ring-white/10">
                    {getInitials(member.name)}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-white sm:text-base">{member.name}</h3>
                    <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] text-purple-300">
                      {member.role}
                    </span>
                    {!member.isActive && (
                      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/35">
                        Inativo
                      </span>
                    )}
                  </div>

                  {member.bio && (
                    <p className="mt-1 line-clamp-1 text-sm text-white/38">{member.bio}</p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/30">
                    <span className="rounded-full border border-white/8 px-2 py-1">
                      Ordem {member.displayOrder}
                    </span>

                    {member.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail size={12} />
                        {member.email}
                      </span>
                    )}

                    {member.github && (
                      <span className="inline-flex items-center gap-1.5">
                        <Github size={12} />
                        {member.github}
                      </span>
                    )}

                    {member.linkedin && (
                      <span className="inline-flex items-center gap-1.5">
                        <Linkedin size={12} />
                        {member.linkedin}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(member)}
                  className="border-blue-500/20 bg-blue-500/10 text-blue-300 hover:border-blue-400/30 hover:bg-blue-500/15 hover:text-blue-200"
                >
                  <Edit size={14} />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(member.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-white/30">
              Nenhum membro cadastrado ainda.
            </div>
          )}
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-h-[92vh] max-w-[min(1100px,96vw)] sm:max-w-[min(1100px,96vw)] overflow-y-auto border-white/8 bg-[#111] p-5 text-white sm:p-6">
          <DialogHeader className="border-b border-white/6 pb-4 pr-8">
            <DialogTitle className="text-xl font-semibold">
              {editingMember ? "Editar Membro" : "Novo Membro"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-1 grid w-full gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
            <form onSubmit={handleSubmit} className="min-w-0 space-y-5">
              <div className="grid gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-2 block">Nome Completo</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="Ex.: Andesson Reis"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Cargo</Label>
                  <Input
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                    required
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="Ex.: Diretor de TI"
                  />
                </div>

                <div className="xl:col-span-2">
                  <Label className="mb-2 block">Biografia</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    className="border-white/10 bg-white/5 text-white"
                    rows={6}
                    placeholder="Resumo curto sobre a pessoa, diretoria ou responsabilidades."
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/80">
                  <ImageIcon size={16} className="text-blue-400" />
                  Foto de perfil
                </div>

                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="border-white/10 bg-white/5 text-white"
                />

                {uploading && <p className="mt-2 text-sm text-yellow-500">Fazendo upload...</p>}
                {formData.image && <p className="mt-2 text-xs text-emerald-400">Imagem carregada com sucesso.</p>}
              </div>

              <div className="grid gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/30">Redes sociais <span className="normal-case text-white/20">&mdash; todos opcionais</span></p>
                </div>
                <div>
                  <Label className="mb-2 block">LinkedIn <span className="text-white/30 font-normal text-xs">(opcional)</span></Label>
                  <Input
                    value={formData.linkedin}
                    onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="username"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">GitHub <span className="text-white/30 font-normal text-xs">(opcional)</span></Label>
                  <Input
                    value={formData.github}
                    onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="username"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Instagram <span className="text-white/30 font-normal text-xs">(opcional)</span></Label>
                  <Input
                    value={formData.instagram}
                    onChange={(e) => setFormData((prev) => ({ ...prev, instagram: e.target.value }))}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="username"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Email <span className="text-white/30 font-normal text-xs">(opcional)</span></Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Ordem de exibição</Label>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, displayOrder: Number.parseInt(e.target.value || "0", 10) }))
                    }
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-white/10 bg-white/[0.05] text-white/80 hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={uploading}>
                  {editingMember ? "Atualizar" : "Criar"} Membro
                </Button>
              </div>
            </form>

            <aside className="hidden md:block">
              <div className="sticky top-0 rounded-2xl border border-white/8 bg-[#0d0d0d] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="mb-4 text-xs uppercase tracking-[0.25em] text-white/25">Preview</p>

                <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]">
                  <div className="flex items-center gap-3 border-b border-white/8 p-4">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt={formData.name || "Preview"}
                        className="h-14 w-14 rounded-xl object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.05] text-sm font-semibold text-white/60 ring-1 ring-white/10">
                        {getInitials(formData.name || (editingMember?.name ?? "NM")) || "NM"}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{formData.name || editingMember?.name || "—"}</p>
                      <p className="mt-1 text-sm text-blue-300">{formData.role || editingMember?.role || "Cargo"}</p>
                    </div>
                  </div>

                  <div className="space-y-4 p-4">
                    <p className="text-sm leading-relaxed text-white/40">
                      {formData.bio || "A biografia aparecerá aqui em uma visualização simples de desktop."}
                    </p>

                    <div className="space-y-2 text-xs text-white/35">
                      {formData.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={12} />
                          <span className="truncate">{formData.email}</span>
                        </div>
                      )}
                      {formData.github && (
                        <div className="flex items-center gap-2">
                          <Github size={12} />
                          <span className="truncate">{buildGithubUrl(formData.github)}</span>
                        </div>
                      )}
                      {formData.linkedin && (
                        <div className="flex items-center gap-2">
                          <Linkedin size={12} />
                          <span className="truncate">{buildLinkedinUrl(formData.linkedin)}</span>
                        </div>
                      )}
                      {formData.instagram && (
                        <div className="flex items-center gap-2">
                          <InstagramIcon size={12} />
                          <span className="truncate">{buildInstagramUrl(formData.instagram)}</span>
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-xs text-white/30">
                      Ordem de exibição: {formData.displayOrder}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

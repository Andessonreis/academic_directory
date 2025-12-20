"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createTeamMember, updateTeamMember, deleteTeamMember } from "@/services/team-service"
import { supabase } from "@/lib/supabase/client"
import type { TeamMember } from "@/types/event"

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

    const { error: uploadError } = await supabase.storage.from("Files").upload(filePath, file)

    if (uploadError) {
      alert("Erro ao fazer upload da imagem: " + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from("Files").getPublicUrl(filePath)

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
        const result = await createTeamMember(formData)
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Gerenciar Time</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {members.map((member) => (
          <Card key={member.id} className="p-4 bg-white/5 border-white/10">
            {member.image && (
              <img
                src={member.image || "/placeholder.svg"}
                alt={member.name}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}
            <h3 className="text-lg font-semibold text-white">{member.name}</h3>
            <p className="text-sm text-purple-400 mb-3">{member.role}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                <Edit size={14} />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(member.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Editar Membro" : "Novo Membro"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome Completo</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label>Cargo</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="PRESIDENTE"
                />
              </div>
            </div>

            <div>
              <Label>Biografia</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
                rows={3}
              />
            </div>

            <div>
              <Label>Foto</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="bg-white/5 border-white/10 text-white"
              />
              {uploading && <p className="text-sm text-yellow-500 mt-1">Fazendo upload...</p>}
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image || "/placeholder.svg"}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <p className="text-xs text-green-500 mt-1">Imagem carregada com sucesso!</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>LinkedIn (username)</Label>
                <Input
                  value={formData.linkedin}
                  onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="username"
                />
              </div>
              <div>
                <Label>GitHub (username)</Label>
                <Input
                  value={formData.github}
                  onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="username"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <Label>Ordem de Exibição</Label>
              <Input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayOrder: Number.parseInt(e.target.value) }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={uploading}>
                {editingMember ? "Atualizar" : "Criar"} Membro
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

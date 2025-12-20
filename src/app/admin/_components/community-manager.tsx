"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Loader2, Link as LinkIcon, MessageCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  createCommunityLink,
  updateCommunityLink,
  deleteCommunityLink,
  getAllCommunityLinks
} from "@/services/community-service"
import type { CommunityLink } from "@/types/event"

const LINK_TYPES = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "discord", label: "Discord", icon: MessageCircle },
  { value: "telegram", label: "Telegram", icon: MessageCircle },
  { value: "clube", label: "Club", icon: LinkIcon },
  { value: "outro", label: "Other", icon: LinkIcon }
]

const CATEGORIES = [
  { value: "Turmas", label: "Classes" },
  { value: "Campus", label: "Campus" },
  { value: "Clubes de Estudo", label: "Study Clubs" }
]

export default function CommunityManager() {
  const [links, setLinks] = useState<CommunityLink[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<CommunityLink | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    type: "whatsapp" as "whatsapp" | "discord" | "telegram" | "clube" | "outro",
    category: "",
    icon: "",
    isActive: true,
    displayOrder: 0
  })

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    setLoading(true)
    const data = await getAllCommunityLinks()
    setLinks(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingLink) {
        await updateCommunityLink(editingLink.id, formData)
      } else {
        await createCommunityLink(formData)
      }
      setIsDialogOpen(false)
      resetForm()
      await loadLinks()
    } catch (error) {
      console.error("Failed to save link:", error)
      alert("Failed to save community link")
    }
  }

  const handleEdit = (link: CommunityLink) => {
    setEditingLink(link)
    setFormData({
      title: link.title,
      description: link.description || "",
      url: link.url,
      type: link.type,
      category: link.category,
      icon: link.icon || "",
      isActive: link.isActive,
      displayOrder: link.displayOrder
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return
    try {
      await deleteCommunityLink(id)
      loadLinks()
    } catch (error) {
      console.error("Failed to delete link:", error)
      alert("Failed to delete link")
    }
  }

  const resetForm = () => {
    setEditingLink(null)
    setFormData({
      title: "",
      description: "",
      url: "",
      type: "whatsapp",
      category: "",
      icon: "",
      isActive: true,
      displayOrder: 0
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "whatsapp": return "text-green-400 bg-green-500/10"
      case "discord": return "text-indigo-400 bg-indigo-500/10"
      case "telegram": return "text-blue-400 bg-blue-500/10"
      case "clube": return "text-purple-400 bg-purple-500/10"
      default: return "text-gray-400 bg-gray-500/10"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-green-500" size={40} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Manage Community</h2>
          <p className="text-sm text-white/60 mt-1">Links for groups, Discord, study clubs, and more</p>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setIsDialogOpen(true)
          }}
          className="bg-green-500 hover:bg-green-600"
        >
          <Plus className="mr-2" size={18} />
          New Link
        </Button>
      </div>

      {links.length === 0 ? (
        <Card className="p-12 bg-white/5 border-white/10 text-center">
          <MessageCircle className="mx-auto mb-4 text-white/30" size={48} />
          <p className="text-white/60">No links registered yet</p>
          <p className="text-sm text-white/40 mt-2">Add group and community links</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <Card key={link.id} className="p-4 bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(link.type)}`}>
                  {LINK_TYPES.find(t => t.value === link.type)?.label}
                </div>
                {!link.isActive && (
                  <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">Inactive</span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">{link.title}</h3>
              <p className="text-sm text-purple-400 mb-2">{link.category}</p>

              {link.description && (
                <p className="text-xs text-white/50 mb-3 line-clamp-2">{link.description}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
                <LinkIcon size={12} />
                <span className="truncate">{link.url}</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(link)} className="flex-1">
                  <Edit size={14} className="mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(link.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLink ? "Edit Link" : "New Community Link"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="e.g., ADS Class 2023.1"
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
                rows={2}
                placeholder="Optional group or community description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type *</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    {LINK_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <Label>Link URL *</Label>
              <Input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                required
                className="bg-white/5 border-white/10 text-white"
                placeholder="https://chat.whatsapp.com/..."
              />
              <p className="text-xs text-white/40 mt-1">
                Paste the full invite link (WhatsApp, Discord, Telegram, etc.)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="isActive" className="cursor-pointer">Active link (visible to users)</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600">
                {editingLink ? "Update" : "Create"} Link
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

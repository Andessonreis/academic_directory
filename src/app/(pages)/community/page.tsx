"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { MessageCircle, ExternalLink, Users, Search } from "lucide-react"
import { getCommunityLinks } from "@/services/community-service"
import type { CommunityLink } from "@/types/event"
import Image from "next/image"
import { Input } from "@/components/ui/input"

const TYPE_ICONS = {
  whatsapp: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
  discord: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png",
  telegram: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
  clube: null,
  outro: null
}

const TYPE_COLORS = {
  whatsapp: "from-green-500/20 to-emerald-500/5 border-green-500/30",
  discord: "from-indigo-500/20 to-blue-500/5 border-indigo-500/30",
  telegram: "from-blue-500/20 to-sky-500/5 border-blue-500/30",
  clube: "from-purple-500/20 to-pink-500/5 border-purple-500/30",
  outro: "from-gray-500/20 to-slate-500/5 border-gray-500/30"
}

export default function CommunityPage() {
  const [links, setLinks] = useState<CommunityLink[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    const data = await getCommunityLinks()
    setLinks(data)
    setLoading(false)
  }

  const filteredLinks = useMemo(() => {
    if (!searchTerm) return links
    return links.filter(link =>
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [links, searchTerm])

  const groupedLinks = useMemo(() => {
    const groups: Record<string, CommunityLink[]> = {}
    filteredLinks.forEach((link) => {
      if (!groups[link.category]) {
        groups[link.category] = []
      }
      groups[link.category].push(link)
    })
    return groups
  }, [filteredLinks])

  return (
    <main className="min-h-screen bg-[#030303] text-white selection:bg-green-500/30">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-16 bg-gradient-to-b from-[#0a0a0f] to-[#030303]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.1),transparent_50%)]" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Users className="text-green-400" size={20} />
              <span className="text-green-400 text-sm font-medium">IFBA Comunidade</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Conecte-se com {" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                IFBA Comunidade
              </span>
            </h1>

            <p className="text-white/60 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Grupos de WhatsApp das turmas, servidor Discord do campus, clubes de estudo e muito mais.
              Tudo em um só lugar para você se conectar com seus colegas.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
                <Input
                  type="text"
                  placeholder="Buscar grupos, turmas, clubes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-green-500/50 focus:ring-green-500/20"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Links Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : Object.keys(groupedLinks).length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <MessageCircle className="mx-auto mb-4 text-white/20" size={64} />
              <h3 className="text-2xl font-semibold text-white mb-2">
                {searchTerm ? "Nenhum resultado encontrado" : "Nenhum link disponível"}
              </h3>
              <p className="text-white/50">
                {searchTerm ? "Tente buscar por outro termo" : "Os links serão adicionados em breve"}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-16">
              {Object.entries(groupedLinks).map(([category, categoryLinks], idx) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-3xl font-bold text-white">{category}</h2>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium">
                      {categoryLinks.length} {categoryLinks.length === 1 ? 'link' : 'links'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categoryLinks.map((link) => (
                      <motion.a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={link.id}
                        whileHover={{ scale: 1.02, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="block group"
                      >
                        <Card className={`h-full p-6 bg-gradient-to-br ${TYPE_COLORS[link.type as keyof typeof TYPE_COLORS]} border backdrop-blur-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {TYPE_ICONS[link.type as keyof typeof TYPE_ICONS] ? (
                                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                                  <Image
                                    src={TYPE_ICONS[link.type as keyof typeof TYPE_ICONS]!}
                                    alt={link.type}
                                    width={28}
                                    height={28}
                                    className="object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                                  <MessageCircle className="text-green-400" size={28} />
                                </div>
                              )}
                            </div>
                            <ExternalLink className="text-white/30 group-hover:text-white/70 transition-colors" size={20} />
                          </div>

                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-300 transition-colors">
                            {link.title}
                          </h3>

                          {link.description && (
                            <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-2">
                              {link.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                              {link.type}
                            </span>
                            <span className="text-sm font-medium text-green-400 group-hover:text-green-300 flex items-center gap-1.5 transition-colors">
                              Entrar
                              <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                          </div>
                        </Card>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, cubicBezier, Variants } from "framer-motion"
import { Card } from "@/components/ui/card"
import { MessageCircle, ExternalLink, Users as UsersIcon } from "lucide-react"
import { getCommunityLinks } from "@/services/community-service"
import type { CommunityLink } from "@/types/event"
import Image from "next/image"

// Ícones para cada tipo
const TYPE_ICONS = {
  whatsapp: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
  discord: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png",
  telegram: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
  clube: null,
  outro: null
}

const TYPE_COLORS = {
  whatsapp: "from-green-500/20 to-emerald-500/5",
  discord: "from-indigo-500/20 to-blue-500/5",
  telegram: "from-blue-500/20 to-sky-500/5",
  clube: "from-purple-500/20 to-pink-500/5",
  outro: "from-gray-500/20 to-slate-500/5"
}

function ScatteredDots() {
  const dots = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
        size: 0.5 + Math.random() * 1.5,
      })),
    []
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.4, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: dot.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: dot.delay,
            ease: "easeInOut",
          }}
          className="absolute bg-white rounded-full"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
          }}
        />
      ))}
    </div>
  )
}

export default function CommunitySection() {
  const [links, setLinks] = useState<CommunityLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    const data = await getCommunityLinks()
    setLinks(data)
    setLoading(false)
  }

  // Agrupar links por categoria
  const groupedLinks = useMemo(() => {
    const groups: Record<string, CommunityLink[]> = {}
    links.forEach((link) => {
      if (!groups[link.category]) {
        groups[link.category] = []
      }
      groups[link.category].push(link)
    })
    return groups
  }, [links])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: cubicBezier(0.4, 0, 0.2, 1) }
    },
  }

  return (
    <section id="community" className="py-24 relative overflow-hidden bg-[#050505]">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-green-900/10 via-transparent to-transparent opacity-40" />
        <ScatteredDots />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : Object.keys(groupedLinks).length === 0 ? null : (
          <div className="space-y-12">
            {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
              <div key={category}>
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-2xl font-bold text-white mb-6 flex items-center gap-3"
                >
                  <span className="h-1 w-12 bg-gradient-to-r from-green-500 to-transparent rounded-full"></span>
                  {category}
                </motion.h3>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                >
                  {categoryLinks.map((link) => (
                    <motion.a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={link.id}
                      variants={cardVariants}
                      className="block group"
                    >
                      <Card className="h-full p-5 bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
                        {/* Hover Gradient Background */}
                        <motion.div
                          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${TYPE_COLORS[link.type as keyof typeof TYPE_COLORS]}`}
                        />

                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {TYPE_ICONS[link.type as keyof typeof TYPE_ICONS] ? (
                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                  <Image
                                    src={TYPE_ICONS[link.type as keyof typeof TYPE_ICONS]!}
                                    alt={link.type}
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                  <MessageCircle className="text-green-400" size={24} />
                                </div>
                              )}
                              <div className="px-2 py-1 rounded-md bg-white/5 text-xs font-medium text-white/60">
                                {link.type.toUpperCase()}
                              </div>
                            </div>
                            <ExternalLink className="text-white/20 group-hover:text-white/60 transition-colors" size={18} />
                          </div>

                          <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
                            {link.title}
                          </h4>

                          {link.description && (
                            <p className="text-white/50 text-sm leading-relaxed mb-4 group-hover:text-white/70 transition-colors line-clamp-2">
                              {link.description}
                            </p>
                          )}

                          <div className="mt-auto">
                            <span className="text-xs font-medium text-green-400/60 group-hover:text-green-400 flex items-center gap-1 transition-colors">
                              Entrar no grupo <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </span>
                          </div>
                        </div>
                      </Card>
                    </motion.a>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

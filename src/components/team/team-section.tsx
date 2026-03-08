"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Linkedin, Github, Mail, X, Loader2 } from "lucide-react"
import { getTeamMembers } from "@/services/team-service"
import type { TeamMember } from "@/types/event"

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  // Lock background scroll when modal is open
  useEffect(() => {
    if (selectedMember) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [selectedMember])

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await getTeamMembers()
        setMembers(data)
        setLoading(false)
      } catch (error) {
        console.error("[v0] Erro ao carregar membros:", error)
        setMembers([])
        setLoading(false)
      }
    }
    loadMembers()
  }, [])

  if (loading) {
    return (
      <section id="time" className="py-24 bg-[#050505] flex justify-center items-center">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </section>
    )
  }

  return (
    <section id="time" className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-[#050505]">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 sm:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-4"
          >
            Nosso{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Time</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto"
          >
            Conheça quem faz acontecer.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedMember(member)}
              className="cursor-pointer group"
            >
              <Card className="p-4 bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-purple-500/30 transition-all">
                <div className="relative mb-3 overflow-hidden rounded-lg aspect-square">
                  {member.image ? (
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <span className="text-4xl text-white/40">{member.name.charAt(0)}</span>
                    </div>
                  )}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <h3 className="text-base font-bold text-white text-center">
                  {member.name.split(" ").length === 1
                    ? member.name
                    : `${member.name.split(" ")[0]} ${member.name.split(" ")[member.name.split(" ").length - 1]}`}
                </h3>
                <p className="text-xs text-purple-400 text-center uppercase tracking-wider mt-1">{member.role}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedMember(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md md:max-w-4xl bg-[#111] border border-white/10 rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] md:max-h-[90vh]"
          >
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-3 right-3 z-20 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            {/* ── Mobile: GitHub-style centered circular avatar ── */}
            <div className="flex flex-col items-center pt-6 pb-2 md:hidden">
              <div className="w-2 h-1 rounded-full bg-white/20 mb-4" />
              {selectedMember.image ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white/10 shadow-lg">
                  <img
                    src={selectedMember.image || "/placeholder.svg"}
                    alt={selectedMember.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border-2 border-white/10">
                  <span className="text-3xl text-white/50">{selectedMember.name.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* ── Desktop: side image (preserve current look) ── */}
            <div className="hidden md:block md:w-2/5 relative flex-shrink-0">
              {selectedMember.image ? (
                <img
                  src={selectedMember.image || "/placeholder.svg"}
                  alt={selectedMember.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
              )}
            </div>

            <div className="p-5 md:p-8 flex-1 flex flex-col overflow-y-auto">
              <div className="text-center md:text-left">
                <h2 className="text-lg md:text-3xl font-bold text-white mb-1 md:mb-2 md:pr-8">{selectedMember.name}</h2>
                <p className="text-purple-400 font-bold uppercase tracking-wider text-[11px] md:text-sm mb-4">{selectedMember.role}</p>
              </div>
              {selectedMember.bio && (
                <div className="mb-5">
                  <p className="text-white/65 text-xs md:text-base leading-relaxed text-center md:text-left">
                    {selectedMember.bio}
                  </p>
                </div>
              )}
              <div className="flex justify-center md:justify-start gap-2 md:gap-3 mt-auto pt-3">
                {selectedMember.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${selectedMember.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={18} className="text-white/60" />
                  </a>
                )}
                {selectedMember.github && (
                  <a
                    href={`https://github.com/${selectedMember.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    aria-label="GitHub"
                  >
                    <Github size={18} className="text-white/60" />
                  </a>
                )}
                {selectedMember.instagram && (
                  <a
                    href={`https://instagram.com/${selectedMember.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon size={18} />
                  </a>
                )}
                {selectedMember.email && (
                  <a
                    href={`mailto:${selectedMember.email}`}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    aria-label="E-mail"
                  >
                    <Mail size={18} className="text-white/60" />
                  </a>
                )}
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="mt-4 w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-colors text-sm font-medium md:hidden"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  )
}

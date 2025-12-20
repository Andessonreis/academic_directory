"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Linkedin, Github, Mail, X, Loader2 } from "lucide-react"
import { getTeamMembers } from "@/services/team-service"
import type { TeamMember } from "@/types/event"

export default function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

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
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedMember(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm md:max-w-4xl bg-[#111] border border-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-3 right-3 z-20 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            <div className="w-full md:w-2/5 h-48 md:h-auto relative flex-shrink-0">
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
            <div className="p-4 sm:p-6 md:p-8 flex-1 flex flex-col">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 pr-8">{selectedMember.name}</h2>
              <p className="text-purple-400 font-bold uppercase tracking-wider text-xs md:text-sm mb-4">{selectedMember.role}</p>
              {selectedMember.bio && (
                <div className="relative mb-6">
                  <div className="h-32 sm:h-40 md:h-auto md:flex-1 overflow-y-auto md:overflow-visible pr-2 md:pr-0">
                    <p className="text-white/70 text-xs sm:text-sm md:text-base leading-relaxed">
                      {selectedMember.bio}
                    </p>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#111] via-[#111]/70 to-transparent md:hidden" />
                </div>
              )}
              <div className="flex gap-2 md:gap-3 mt-auto pt-4">
                {selectedMember.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${selectedMember.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 md:p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
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
                    className="p-2 md:p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="GitHub"
                  >
                    <Github size={18} className="text-white/60" />
                  </a>
                )}
                {selectedMember.email && (
                  <a
                    href={`mailto:${selectedMember.email}`}
                    className="p-2 md:p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="E-mail"
                  >
                    <Mail size={18} className="text-white/60" />
                  </a>
                )}
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="mt-4 w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-colors text-sm font-medium md:hidden"
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

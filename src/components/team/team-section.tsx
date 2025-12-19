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
        console.log("[v0] Iniciando carregamento dos membros do time...")
        const data = await getTeamMembers()
        console.log("[v0] Dados recebidos:", data)
        console.log("[v0] Comprimento do array:", data.length)
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
    <section id="time" className="py-24 relative overflow-hidden bg-[#050505]">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            Nosso{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Time</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedMember(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row"
          >
            <div className="w-full md:w-2/5 h-64 md:h-auto relative">
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
            <div className="p-8 flex-1">
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-6 right-6 text-white/40 hover:text-white"
              >
                <X size={24} />
              </button>
              <h2 className="text-3xl font-bold text-white mb-2">{selectedMember.name}</h2>
              <p className="text-purple-400 font-bold uppercase tracking-wider mb-6">{selectedMember.role}</p>
              {selectedMember.bio && <p className="text-white/70 mb-6">{selectedMember.bio}</p>}
              <div className="flex gap-3">
                {selectedMember.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${selectedMember.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Linkedin size={20} className="text-white/60" />
                  </a>
                )}
                {selectedMember.github && (
                  <a
                    href={`https://github.com/${selectedMember.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Github size={20} className="text-white/60" />
                  </a>
                )}
                {selectedMember.email && (
                  <a
                    href={`mailto:${selectedMember.email}`}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Mail size={20} className="text-white/60" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  )
}

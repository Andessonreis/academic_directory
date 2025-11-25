"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Github, Linkedin, X, ChevronRight } from "lucide-react"
import Image from "next/image"

const teamMembers = [
  {
    name: "Ana Souza",
    role: "PRESIDENTE",
    imageSrc: "/professional-cto-headshot.png",
    bio: "Responsável pela liderança estratégica do D.A., focada em promover a integração entre estudantes e coordenação.",
    linkedin: "#", github: "#"
  },
  {
    name: "Carlos Lima",
    role: "VICE-PRESIDENTE",
    imageSrc: "/professional-cto-headshot.png",
    bio: "Apoia a presidência e gerencia os projetos internos, garantindo que as metas da gestão sejam alcançadas.",
    linkedin: "#", github: "#"
  },
  {
    name: "Mariana Costa",
    role: "DIRETORA GERAL",
    imageSrc: "/professional-cto-headshot.png",
    bio: "Coordena as diretorias e organiza o fluxo de trabalho do time para maximizar a produtividade.",
    linkedin: "#", github: "#"
  },
  {
    name: "Pedro Alves",
    role: "DIR. EVENTOS",
    imageSrc: "/professional-cto-headshot.png",
    bio: "Organiza hackathons, palestras e workshops para o desenvolvimento técnico dos alunos.",
    linkedin: "#", github: "#"
  },
  {
    name: "Beatriz Rocha",
    role: "COMUNICAÇÃO",
    imageSrc: "/professional-cto-headshot.png",
    bio: "Gerencia as redes sociais e a identidade visual do D.A., garantindo que a voz dos alunos seja ouvida.",
    linkedin: "#", github: "#"
  },
  { name: "Lucas M.", role: "FINANÇAS", imageSrc: "/professional-cto-headshot.png", bio: "Cuida do tesouro do D.A.", linkedin: "#", github: "#" },
  { name: "Fernanda D.", role: "ENSINO", imageSrc: "/professional-cto-headshot.png", bio: "Lidera iniciativas acadêmicas.", linkedin: "#", github: "#" },
  { name: "Rafael M.", role: "INFRAESTRUTURA", imageSrc: "/professional-cto-headshot.png", bio: "Focado em melhorias do campus.", linkedin: "#", github: "#" },
  { name: "Juliana M.", role: "CONSELHEIRA", imageSrc: "/professional-cto-headshot.png", bio: "Apoio estratégico.", linkedin: "#", github: "#" },
  { name: "Gabriel N.", role: "CONSELHEIRO", imageSrc: "/professional-cto-headshot.png", bio: "Apoio estratégico.", linkedin: "#", github: "#" },
]

export default function TeamSection() {
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null)

  return (
    <section id="time" className="py-24 relative">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Nosso Time
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Conheça quem faz acontecer.
          </p>
        </motion.div>

        <div className="flex md:hidden overflow-x-auto gap-4 pb-8 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="snap-center min-w-[260px] bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
              onClick={() => setSelectedMember(member)}
            >
              <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-purple-500/30">
                <Image
                  src={member.imageSrc}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-white font-bold text-lg">{member.name}</h3>
              <p className="text-purple-400 text-sm font-medium mb-2">{member.role}</p>
              <span className="text-white/40 text-xs uppercase tracking-widest mt-auto">Ver Bio +</span>
            </div>
          ))}

          <div className="min-w-[20px]" />
        </div>

        <div className="hidden md:grid grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-6 justify-items-center">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              onClick={() => setSelectedMember(member)}
              className="group cursor-pointer flex flex-col items-center text-center w-full"
            >
              <div className="relative w-32 h-32 lg:w-40 lg:h-40 mb-4 rounded-3xl overflow-hidden border border-white/10 group-hover:border-purple-500/50 transition-all duration-500 shadow-lg">
                <Image
                  src={member.imageSrc}
                  alt={member.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="text-white font-bold text-lg tracking-wide group-hover:text-purple-400 transition-colors">
                {member.name.toUpperCase()}
              </h3>
              <p className="text-white/40 text-xs font-bold tracking-widest mt-1">
                {member.role}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-auto overflow-y-auto md:overflow-visible"
            >
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 z-10 p-2 text-white/50 hover:text-white bg-black/20 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full md:w-2/5 h-64 md:h-auto relative bg-zinc-900 shrink-0">
                <Image
                  src={selectedMember.imageSrc}
                  alt={selectedMember.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent md:bg-gradient-to-r" />
              </div>

              <div className="w-full md:w-3/5 p-6 md:p-12 flex flex-col justify-center text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {selectedMember.name}
                </h2>
                <p className="text-purple-400 font-medium text-lg mb-6">
                  {selectedMember.role}
                </p>

                <div className="flex gap-3 mb-8">
                  <a href={selectedMember.linkedin} className="bg-white/5 hover:bg-[#0077b5] p-2 rounded text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href={selectedMember.github} className="bg-white/5 hover:bg-black p-2 rounded text-white transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                </div>

                <p className="text-white/70 leading-relaxed mb-8 border-l-2 border-purple-500/30 pl-4">
                  {selectedMember.bio}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}

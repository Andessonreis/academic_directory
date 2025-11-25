"use client"

import { motion, cubicBezier, Variants } from "framer-motion"
import { Card } from "@/components/ui/card"
import {
  IdCard,
  FileText,
  MessageCircle,
  ShoppingBag,
  Users,
  Percent,
  ArrowUpRight
} from "lucide-react"
import { useState, useMemo } from "react"


const SERVICES = [
  {
    icon: IdCard,
    title: "Carteirinha Digital",
    description: "Solicite ou renove sua carteira de estudante oficial. Garanta meia-entrada e acesso ao campus.",
    link: "#carteirinha",
    color: "purple"
  },
  {
    icon: FileText,
    title: "Transparência",
    description: "Acesse as atas de reuniões, estatuto do DA e prestações de contas mensais.",
    link: "#documentos",
    color: "blue"
  },
  {
    icon: Users,
    title: "Comunidade",
    description: "Links diretos para os grupos de WhatsApp das turmas, Discord do campus e clubes de estudo.",
    link: "#comunidade",
    color: "green"
  },
  {
    icon: MessageCircle,
    title: "Ouvidoria",
    description: "Espaço seguro para denúncias, sugestões e críticas. Sua identidade pode ser mantida em sigilo.",
    link: "#ouvidoria",
    color: "pink"
  },
  {
    icon: ShoppingBag,
    title: "Lojinha do DA",
    description: "Mostre seu orgulho! Camisas, canecas, tirantes e outros produtos exclusivos do seu curso.",
    link: "#loja",
    color: "orange"
  },
  {
    icon: Percent,
    title: "Clube de Descontos",
    description: "Lista de comércios parceiros na cidade que oferecem descontos para alunos do IFBA.",
    link: "#parceiros",
    color: "yellow"
  },
]

function ScatteredDots() {
  const dots = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
        size: 0.5 + Math.random() * 1.5,
      })),
    [],
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
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

export default function StudentHub() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section id="servicos" className="py-24 relative overflow-hidden bg-[#050505]">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-blue-900/10 via-transparent to-transparent opacity-40" />
        <ScatteredDots />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            Central do <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Estudante</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            Tudo o que você precisa para facilitar sua vida acadêmica em um só lugar.
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {SERVICES.map((service, index) => (
            <motion.a
              href={service.link}
              key={index}
              variants={cardVariants}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              className="block group"
            >
              <Card className="h-full p-6 bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">

                {/* Hover Gradient Background */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at center, ${service.color === 'purple' ? 'rgba(168, 85, 247, 0.15)' :
                      service.color === 'blue' ? 'rgba(59, 130, 246, 0.15)' :
                        service.color === 'green' ? 'rgba(34, 197, 94, 0.15)' :
                          service.color === 'pink' ? 'rgba(236, 72, 153, 0.15)' :
                            service.color === 'orange' ? 'rgba(249, 115, 22, 0.15)' :
                              'rgba(234, 179, 8, 0.15)'
                      }, transparent 70%)`
                  }}
                />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors ${service.color === 'purple' ? 'text-purple-400' :
                      service.color === 'blue' ? 'text-blue-400' :
                        service.color === 'green' ? 'text-green-400' :
                          service.color === 'pink' ? 'text-pink-400' :
                            service.color === 'orange' ? 'text-orange-400' :
                              'text-yellow-400'
                      }`}>
                      <service.icon size={24} />
                    </div>
                    <ArrowUpRight className="text-white/20 group-hover:text-white/60 transition-colors" size={20} />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-white/50 text-sm leading-relaxed mb-4 group-hover:text-white/70 transition-colors">
                    {service.description}
                  </p>

                  <div className="mt-auto">
                    <span className="text-xs font-medium text-white/30 group-hover:text-white/60 flex items-center gap-1 transition-colors">
                      Acessar <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              </Card>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

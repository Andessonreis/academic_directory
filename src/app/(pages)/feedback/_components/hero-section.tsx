"use client"

import { motion } from "framer-motion"
import { Sparkles, Shield, Clock, Eye } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="pt-20 pb-8 md:pt-32 md:pb-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs text-purple-300 font-medium">
            Canal Oficial
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 text-balance"
        >
          <span className="text-white">Central de Feedback</span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Diretório do Estudante
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/50 text-base md:text-lg max-w-xl mx-auto mb-8 text-pretty"
        >
          Sua voz importa. Envie sugestões, elogios, reclamações ou relatos de
          incidentes de forma segura e confidencial.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hidden md:flex flex-wrap justify-center gap-3"
        >
          {[
            { icon: Shield, label: "100% Confidencial" },
            { icon: Clock, label: "Resposta em até 10 dias" },
            { icon: Eye, label: "Envios anônimos" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
            >
              <item.icon className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white/70">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

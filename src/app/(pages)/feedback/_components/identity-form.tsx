"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Eye, User, Mail } from "lucide-react"
import type { FormData } from "./types"

interface IdentityFormProps {
  isAnonymous: boolean
  formData: FormData
  onToggleAnonymous: () => void
  onFormChange: (data: Partial<FormData>) => void
}

export default function IdentityForm({ isAnonymous, formData, onToggleAnonymous, onFormChange }: IdentityFormProps) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg md:text-xl font-semibold mb-4 text-white/90">Como deseja se identificar?</h2>

      <motion.button
        onClick={onToggleAnonymous}
        className={`w-full p-4 rounded-2xl border mb-4 flex items-center justify-between transition-all duration-300 ${isAnonymous ? "bg-purple-500/20 border-purple-500/40" : "bg-white/5 border-white/10"
          }`}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${isAnonymous ? "bg-purple-500/30" : "bg-white/10"
              }`}
          >
            <Eye className={`w-5 h-5 ${isAnonymous ? "text-purple-300" : "text-white/50"}`} />
          </div>
          <div className="text-left">
            <p className={`font-medium ${isAnonymous ? "text-white" : "text-white/70"}`}>Enviar anonimamente</p>
            <p className="text-xs text-white/40">Sua identidade será protegida</p>
          </div>
        </div>
        <div
          className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${isAnonymous ? "bg-purple-500" : "bg-white/20"
            }`}
        >
          <motion.div
            className="w-5 h-5 bg-white rounded-full shadow-lg"
            animate={{ x: isAnonymous ? 20 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </motion.button>

      <AnimatePresence>
        {!isAnonymous && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => onFormChange({ name: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="email"
                placeholder="Seu e-mail (opcional)"
                value={formData.email}
                onChange={(e) => onFormChange({ email: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
              />
            </div>
            <p className="text-xs text-white/40 pl-1">Informe o e-mail para receber atualizações</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

"use client"

import { motion } from "framer-motion"
import { FileText } from "lucide-react"
import type { FormData, FeedbackType, FeedbackOption } from "./types"

interface MessageFormProps {
  formData: FormData
  selectedType: FeedbackType | null
  isAnonymous: boolean
  options: FeedbackOption[]
  onFormChange: (data: Partial<FormData>) => void
}

export default function MessageForm({ formData, selectedType, isAnonymous, options, onFormChange }: MessageFormProps) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg md:text-xl font-semibold mb-4 text-white/90">Descreva sua manifestação</h2>
      <div className="relative">
        <FileText className="absolute left-4 top-4 w-5 h-5 text-white/30" />
        <textarea
          placeholder="Conte-nos os detalhes. Quanto mais informações, melhor poderemos ajudar..."
          value={formData.message}
          onChange={(e) => onFormChange({ message: e.target.value })}
          rows={6}
          maxLength={2000}
          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 resize-none"
        />
        <div className="absolute bottom-3 right-3 text-xs text-white/30">{formData.message.length}/2000</div>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-xs text-white/40 mb-2">Resumo</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs">
            {options.find((o) => o.id === selectedType)?.label}
          </span>
          <span className="px-2 py-1 rounded-md bg-white/10 text-white/60 text-xs">
            {isAnonymous ? "Anônimo" : formData.name || "Identificado"}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

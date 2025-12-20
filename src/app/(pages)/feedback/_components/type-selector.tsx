"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import type { FeedbackType, FeedbackOption } from "./types"

interface TypeSelectorProps {
  selectedType: FeedbackType | null
  onSelect: (type: FeedbackType) => void
  options: FeedbackOption[]
}

export default function TypeSelector({ selectedType, onSelect, options }: TypeSelectorProps) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-lg md:text-xl font-semibold mb-4 text-white/90">Qual tipo de manifestação?</h2>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`relative p-4 md:p-5 rounded-2xl border transition-all duration-300 text-left ${selectedType === option.id
                ? `bg-gradient-to-br ${option.color} border-opacity-100`
                : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`mb-3 ${selectedType === option.id ? "text-white" : "text-white/60"}`}>{option.icon}</div>
            <h3 className={`font-medium text-sm md:text-base ${selectedType === option.id ? "text-white" : "text-white/80"}`}>
              {option.label}
            </h3>
            <p className="text-xs text-white/40 mt-1 hidden md:block">{option.description}</p>
            {selectedType === option.id && (
              <motion.div
                layoutId="selected-check"
                className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-purple-600" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

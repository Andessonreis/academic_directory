"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import type { FaqItem } from "./types"

interface FaqSectionProps {
  items: FaqItem[]
  expandedIndex: number | null
  onToggle: (index: number) => void
}

export default function FaqSection({ items, expandedIndex, onToggle }: FaqSectionProps) {
  return (
    <section className="px-4 pb-16 md:pb-24">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-white/90">Dúvidas Frequentes</h2>
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="rounded-xl bg-white/5 border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => onToggle(index)}
                className="w-full px-4 py-4 flex items-center justify-between text-left"
              >
                <span className="text-sm md:text-base text-white/80 pr-4">{item.question}</span>
                <motion.div animate={{ rotate: expandedIndex === index ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-5 h-5 text-white/40 shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-4 pb-4 text-sm text-white/50">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

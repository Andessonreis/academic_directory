"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface ProgressIndicatorProps {
  currentStep: number
}

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <div className="px-4 mb-6 md:hidden">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${currentStep >= step ? "bg-purple-500 text-white" : "bg-white/10 text-white/40"
                }`}
              animate={{
                scale: currentStep === step ? 1.1 : 1,
              }}
            >
              {currentStep > step ? <Check className="w-4 h-4" /> : step}
            </motion.div>
            {step < 3 && (
              <div
                className={`w-16 h-0.5 mx-2 transition-colors duration-300 ${currentStep > step ? "bg-purple-500" : "bg-white/10"
                  }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between max-w-sm mx-auto mt-2 px-1">
        <span className="text-[10px] text-white/40">Tipo</span>
        <span className="text-[10px] text-white/40">Dados</span>
        <span className="text-[10px] text-white/40">Mensagem</span>
      </div>
    </div>
  )
}

"use client"

import { motion } from "framer-motion"
import { Send, ArrowRight } from "lucide-react"

interface FormNavigationProps {
  currentStep: number
  isSubmitting: boolean
  canProceed: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
}

export default function FormNavigation({
  currentStep,
  isSubmitting,
  canProceed,
  onBack,
  onNext,
  onSubmit,
}: FormNavigationProps) {
  return (
    <div className="flex gap-3 mt-6">
      {currentStep > 1 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/70 font-medium hover:bg-white/10 transition-all duration-300"
        >
          Voltar
        </motion.button>
      )}
      <motion.button
        onClick={currentStep === 3 ? onSubmit : onNext}
        disabled={!canProceed || isSubmitting}
        className={`flex-1 py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${canProceed
            ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-500 hover:to-violet-500"
            : "bg-white/10 text-white/30 cursor-not-allowed"
          }`}
        whileTap={canProceed ? { scale: 0.98 } : {}}
      >
        {isSubmitting ? (
          <>
            <motion.div
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
            Enviando...
          </>
        ) : currentStep === 3 ? (
          <>
            <Send className="w-5 h-5" />
            Enviar Manifestação
          </>
        ) : (
          <>
            Continuar
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>
    </div>
  )
}

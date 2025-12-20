"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

interface SuccessModalProps {
  show: boolean
  onClose: () => void
}

export default function SuccessModal({ show, onClose }: SuccessModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center relative z-10"
            >
              <Check className="w-8 h-8 text-white" />
            </motion.div>

            <h3 className="text-xl font-bold text-white mb-2 relative z-10">Enviado com sucesso!</h3>
            <p className="text-white/50 text-sm mb-6 relative z-10">
              Sua manifestação foi registrada. Agradecemos por contribuir com a melhoria do nosso ambiente acadêmico.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-white/10 border border-white/10 text-white font-medium hover:bg-white/20 transition-all duration-300 relative z-10"
            >
              Fechar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

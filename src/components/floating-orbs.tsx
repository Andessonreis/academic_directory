"use client"

import { motion } from "framer-motion"

export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Large floating orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${150 + i * 50}px`,
            height: `${150 + i * 50}px`,
            left: `${10 + i * 20}%`,
            top: `${20 + i * 15}%`,
            background: `radial-gradient(circle at 30% 30%, 
              oklch(${0.4 + i * 0.05} ${0.2 + i * 0.02} ${240 + i * 20} / 0.15) 0%, 
              oklch(${0.3 + i * 0.05} ${0.25} ${280 + i * 10} / 0.05) 50%, 
              transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={{
            y: [0, -30 - i * 10, 0],
            x: [0, 20 + i * 5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10 + i * 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: i * 2,
          }}
        />
      ))}
    </div>
  )
}

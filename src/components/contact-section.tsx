"use client"

import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import { useEffect, useState, Suspense, useMemo } from "react"
import dynamic from "next/dynamic"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

const Bear3D = dynamic(() => import("./3d-bear"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full animate-pulse" />
  ),
})

function ScatteredDots() {
  const dots = useMemo(
    () =>

      Array.from({ length: 15 }, (_, i) => ({
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
          className="absolute bg-white rounded-full will-change-transform"
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

function CentralGlow() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="w-80 h-80 bg-gradient-to-r from-purple-500/30 via-pink-500/40 to-violet-500/30 rounded-full blur-3xl will-change-transform"
      />
    </div>
  )
}

function AnimatedText({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ")

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: delay },
    }),
  }

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(4px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  }

  return (
    <motion.span variants={container} initial="hidden" animate="visible" className="inline-block">
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block mr-2 text-white font-medium drop-shadow-md"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}

function GlitchText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative inline-block group"
    >
      <span className="relative z-10 text-white font-bold drop-shadow-xl group-hover:text-purple-300 transition-colors duration-300">
        {text}
      </span>
      <span
        className="absolute top-0 left-0 text-purple-400 opacity-0 group-hover:opacity-70 group-hover:animate-pulse"
        aria-hidden="true"
      >
        {text}
      </span>
    </motion.span>
  )
}

export default function HeroGeometric({
  badge = "Gestão 2024 - 2025",
  title1 = "Diretório Acadêmico IFBA",
  subtitle = "A voz ativa dos estudantes. Juntos construindo uma educação pública, gratuita e de qualidade.",
}: {
  badge?: string
  title1?: string
  subtitle?: string
}) {
  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.2 + i * 0.1,
        ease: "easeOut",
      },
    }),
  }

  return (
    <div className={cn("relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black", inter.className)}>

      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-purple-950/30" />

      <ScatteredDots />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] z-10 pointer-events-none md:pointer-events-auto">
        <Suspense fallback={null}>
          <Bear3D />
        </Suspense>
      </div>

      <CentralGlow />

      <div className="relative z-20 container mx-auto px-4 md:px-6 pointer-events-none">
        <div className="max-w-4xl mx-auto text-center pointer-events-auto">
          {/* Badge */}
          <motion.div custom={0} variants={fadeUpVariants} initial="hidden" animate="visible" className="mb-6 md:mb-8">
            <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
              <span className="text-xs md:text-sm text-purple-200 font-semibold tracking-wide">
                {badge}
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible" className="mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-light tracking-tight leading-tight">
              {title1.split(" ").map((word, index) => (
                <span key={index} className="inline-block mr-2 md:mr-4">
                  <GlitchText text={word} delay={0.5 + index * 0.1} />
                </span>
              ))}
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
            <div className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto font-medium">
              <AnimatedText text={subtitle} delay={1.5} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

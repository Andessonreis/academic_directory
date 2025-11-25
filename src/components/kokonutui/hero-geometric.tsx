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
})

const Bear3D = dynamic(() => import("../3d-bear"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full animate-pulse" />
  ),
})

function TypeWriter({ text, delay = 0, speed = 80 }: { text: string; delay?: number; speed?: number }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentIndex >= text.length) {
      setIsComplete(true)
      return
    }

    const timer = setTimeout(
      () => {
        setDisplayText(text.slice(0, currentIndex + 1))
        setCurrentIndex((prev) => prev + 1)
      },
      delay + currentIndex * speed,
    )

    return () => clearTimeout(timer)
  }, [currentIndex, text, delay, speed])

  return (
    <span className="relative">
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
        {displayText.split("").map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20, rotateX: -90, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              rotateX: 0,
              scale: 1,
              textShadow: [
                "0 0 0px rgba(168, 85, 247, 0)",
                "0 0 20px rgba(168, 85, 247, 0.8)",
                "0 0 0px rgba(168, 85, 247, 0)",
              ],
            }}
            transition={{
              duration: 0.6,
              delay: index * 0.05,
              ease: [0.25, 0.4, 0.25, 1],
            }}
            className="inline-block text-white font-semibold drop-shadow-lg"
            style={{
              transformOrigin: "center bottom",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.span>
      {!isComplete && (
        <motion.span
          animate={{
            opacity: [1, 0],
            scaleY: [1, 0.8, 1],
            backgroundColor: ["rgba(168, 85, 247, 1)", "rgba(236, 72, 153, 1)", "rgba(168, 85, 247, 1)"],
          }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="inline-block w-0.5 h-[1em] ml-1 rounded-full shadow-lg shadow-purple-500/50"
        />
      )}
    </span>
  )
}

function ScatteredDots() {
  const dots = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
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
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: dot.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: dot.delay,
            ease: "easeInOut",
          }}
          className="absolute bg-white rounded-full"
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
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="w-96 h-96 bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-violet-900/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-2xl"
      />
    </div>
  )
}

function AnimatedText({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ")

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.12,
            delayChildren: delay,
          },
        },
      }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: {
              opacity: 0,
              y: 30,
              rotateX: -45,
              filter: "blur(8px)",
              scale: 0.8,
            },
            visible: {
              opacity: 1,
              y: 0,
              rotateX: 0,
              filter: "blur(0px)",
              scale: 1,
              transition: {
                duration: 0.8,
                type: "spring" as const,
                stiffness: 100,
                damping: 15,
              },
            },
          }}
          whileHover={{
            scale: 1.05,
            color: "#e879f9",
            textShadow: "0 0 20px rgba(232, 121, 249, 0.6)",
            transition: { duration: 0.2 },
          }}
          className="inline-block mr-2 cursor-default text-white font-medium drop-shadow-md"
          style={{ transformOrigin: "center bottom" }}
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="relative inline-block"
    >
      <motion.span
        animate={{
          textShadow: ["0 0 0 transparent", "2px 0 0 #ff0080, -2px 0 0 #00ffff", "0 0 0 transparent"],
        }}
        transition={{
          duration: 0.1,
          repeat: 3,
          delay: delay + 1,
          repeatDelay: 2,
        }}
        className="relative z-10 text-white font-bold drop-shadow-xl"
      >
        {text}
      </motion.span>
      <motion.span
        className="absolute top-0 left-0 text-purple-400 opacity-70"
        animate={{
          x: [0, 2, -2, 0],
          opacity: [0, 0.7, 0],
        }}
        transition={{
          duration: 0.15,
          repeat: 2,
          delay: delay + 1.2,
          repeatDelay: 3,
        }}
      >
        {text}
      </motion.span>
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
    hidden: {
      opacity: 0,
      y: 40,
      filter: "blur(8px)",
      scale: 0.95,
      rotateX: -15,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 1,
        delay: 0.3 + i * 0.2,
        type: "spring" as const,
        stiffness: 80,
        damping: 20,
      },
    }),
  }

  return (
    <div
      className={cn(
        "relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]",
        inter.className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#030303] to-[#030303]" />

      <ScatteredDots />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-96 md:h-96 z-10">
        <Suspense
          fallback={
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full"
            />
          }
        >
          <Bear3D />
        </Suspense>
      </div>

      <CentralGlow />

      <div className="relative z-20 container mx-auto px-6 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div custom={0} variants={fadeUpVariants} initial="hidden" animate="visible" className="mb-8">
            <motion.div
              whileHover={{
                scale: 1.08,
                boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)",
                backgroundColor: "rgba(168, 85, 247, 0.15)",
              }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm mb-6 transition-all duration-300"
            >
              <span className="text-sm text-purple-200 font-semibold drop-shadow-md">
                <AnimatedText text={badge} delay={0.8} />
              </span>
            </motion.div>
          </motion.div>

          <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light mb-8 tracking-tight leading-tight">
              {title1.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  className="inline-block mr-4 cursor-default"
                  whileHover={{
                    scale: 1.1,
                    color: "#e879f9",
                    textShadow: "0 0 30px rgba(232, 121, 249, 0.8)",
                    filter: "drop-shadow(0 0 20px rgba(232, 121, 249, 0.6))",
                    transition: { duration: 0.3, ease: "easeOut" },
                  }}
                  style={{ transformOrigin: "center" }}
                >
                  <GlitchText text={word} delay={1.2 + index * 0.2} />
                </motion.span>
              ))}
            </h1>
          </motion.div>

          <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
            <p className="text-lg sm:text-xl text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto font-medium drop-shadow-md">
              <AnimatedText text={subtitle} delay={4} />
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

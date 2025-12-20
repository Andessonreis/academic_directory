"use client"

import { motion, cubicBezier, Variants } from "framer-motion"
import { Card } from "@/components/ui/card"
import {
  IdCard,
  FileText,
  MessageCircle,
  ShoppingBag,
  Users,
  Percent,
  ArrowUpRight
} from "lucide-react"
import { useEffect, useState } from "react"


const SERVICES = [
  {
    icon: IdCard,
    title: "Central do Estudante",
    description: "Explore identificações oficiais institucionais, ative softwares educacionais e profissionais e conecte-se à comunidade IFBA.",
    link: "/student-id",
    color: "purple"
  },
  /*   {
      icon: FileText,
      title: "Transparência",
      description: "Acesse as atas de reuniões, estatuto do DA e prestações de contas mensais.",
      link: "#documentos",
      color: "blue"
    }, */
  {
    icon: Users,
    title: "Comunidade",
    description: "Acesso direto aos grupos de WhatsApp, servidor do campus no Discord e clubes de estudo.",
    link: "/community",
    color: "green"
  },
  {
    icon: MessageCircle,
    title: "Canal de Feedback",
    description: "Espaço seguro para sugestões, reclamações, elogios ou relatos anônimos.",
    link: "/feedback",
    color: "pink"
  }

  /*   {
      icon: ShoppingBag,
      title: "Lojinha do DA",
      description: "Mostre seu orgulho! Camisas, canecas, tirantes e outros produtos exclusivos do seu curso.",
      link: "#loja",
      color: "orange"
    },
    {
      icon: Percent,
      title: "Clube de Descontos",
      description: "Lista de comércios parceiros na cidade que oferecem descontos para alunos do IFBA.",
      link: "#parceiros",
      color: "yellow"
    }, */
]

const CARD_ACCENTS = {
  purple: { icon: "text-purple-300", glow: "rgba(168, 85, 247, 0.18)" },
  blue: { icon: "text-blue-300", glow: "rgba(59, 130, 246, 0.18)" },
  green: { icon: "text-green-300", glow: "rgba(34, 197, 94, 0.18)" },
  pink: { icon: "text-pink-300", glow: "rgba(236, 72, 153, 0.18)" },
  orange: { icon: "text-orange-300", glow: "rgba(249, 115, 22, 0.2)" },
  yellow: { icon: "text-yellow-300", glow: "rgba(234, 179, 8, 0.18)" },
} as const

const getAccentStyles = (color?: keyof typeof CARD_ACCENTS) => CARD_ACCENTS[color ?? "yellow"] ?? CARD_ACCENTS.yellow

type Dot = {
  id: number
  x: number
  y: number
  delay: number
  duration: number
  size: number
}

function ScatteredDots({ enabled = true }: { enabled?: boolean }) {
  const [dots, setDots] = useState<Dot[]>([])

  useEffect(() => {
    if (!enabled) {
      setDots([])
      return
    }
    const generateDots = (): Dot[] =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 1.5,
        size: 0.5 + Math.random() * 1.5,
      }))

    setDots(generateDots())
  }, [])

  if (!enabled) return null
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

export default function StudentHub() {
  const [isDesktop, setIsDesktop] = useState(false)
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onReduced = () => setPrefersReduced(mq.matches)
    onReduced()
    mq.addEventListener?.('change', onReduced)
    return () => {
      window.removeEventListener('resize', checkDesktop)
      mq.removeEventListener?.('change', onReduced)
    }
  }, [])
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  }

  const cardVariants: Variants = prefersReduced || !isDesktop
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : {
      hidden: { opacity: 0, y: 26, scale: 0.95 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.45, ease: cubicBezier(0.4, 0, 0.2, 1) },
      },
    }

  const renderCard = (service: (typeof SERVICES)[number], index: number, variant: "carousel" | "grid" = "grid") => {
    const accent = getAccentStyles(service.color as keyof typeof CARD_ACCENTS)
    const wrapperClasses = [
      "group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60",
      variant === "carousel" ? "min-w-[250px] max-w-[280px] snap-center" : "",
    ]
      .filter(Boolean)
      .join(" ")

    return (
      <motion.a
        href={service.link}
        key={`${service.title}-${index}`}
        variants={cardVariants}
        className={wrapperClasses}
        aria-label={`Ir para ${service.title}`}
      >
        <Card className="relative flex h-full flex-col overflow-hidden border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]">
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: `radial-gradient(circle at center, ${accent.glow}, transparent 70%)` }}
          />

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className={`rounded-xl bg-white/5 p-3 ${accent.icon}`}>
                <service.icon size={22} />
              </div>
              <ArrowUpRight className="text-white/30 transition-colors group-hover:text-white/70" size={18} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white sm:text-xl">{service.title}</h3>
              <p className="text-sm leading-relaxed text-white/65">{service.description}</p>
            </div>

            <span className="mt-auto inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-white/40 transition-colors group-hover:text-white">
              Acessar
              <span className="ml-2 translate-x-0 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </div>
        </Card>
      </motion.a>
    )
  }

  return (
    <section id="servicos" className="relative overflow-hidden bg-[#050505] py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-radial from-blue-900/10 via-transparent to-transparent opacity-40" />
        <ScatteredDots enabled={isDesktop && !prefersReduced} />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 text-center sm:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-white sm:text-4xl"
          >
            Central do <span className="bg-gradient-to-r from-blue-300 to-purple-400 bg-clip-text text-transparent">Estudante</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-3 max-w-2xl text-sm text-white/65 sm:text-base"
          >
            Atalhos rápidos para os serviços mais usados, com foco na navegação suave em qualquer tela.
          </motion.p>
        </div>

        <div className="space-y-8">
          <motion.div
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:hidden"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {SERVICES.map((service, index) => renderCard(service, index, "carousel"))}
          </motion.div>

          <motion.div
            className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {SERVICES.map((service, index) => renderCard(service, index))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

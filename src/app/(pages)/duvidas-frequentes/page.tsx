"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, ArrowLeft, HelpCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { getFaqs } from "@/services/faq-service"
import type { FaqItemDB } from "@/types/event"

/* ── Hardcoded fallback FAQs (always visible) ── */
const FALLBACK_FAQS: FaqItemDB[] = [
  {
    id: "fallback-1",
    question: "Quanto tempo leva para receber uma resposta?",
    answer: "O prazo médio é de 5 a 10 dias úteis, dependendo da complexidade. Denúncias urgentes são priorizadas.",
    category: "Manifestações",
    displayOrder: 0,
    isActive: true,
  },
  {
    id: "fallback-2",
    question: "Posso acompanhar o status da minha manifestação?",
    answer: "Sim! Se informar seu e-mail, você receberá atualizações sobre o andamento do seu caso.",
    category: "Manifestações",
    displayOrder: 1,
    isActive: true,
  },
  {
    id: "fallback-3",
    question: "Minha identidade será protegida?",
    answer: "Absolutamente. Manifestações anônimas são tratadas com o mesmo cuidado e confidencialidade.",
    category: "Privacidade",
    displayOrder: 2,
    isActive: true,
  },
  {
    id: "fallback-4",
    question: "Quem tem acesso às informações?",
    answer: "Apenas membros autorizados da gestão do DA, seguindo protocolos rígidos de privacidade.",
    category: "Privacidade",
    displayOrder: 3,
    isActive: true,
  },
]

export default function DuvidasFrequentesPage() {
  const [dbFaqs, setDbFaqs] = useState<FaqItemDB[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    getFaqs()
      .then((data) => setDbFaqs(data))
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [])

  // Merge DB FAQs with fallback: if DB has items, use DB only; otherwise show fallback
  const faqs = useMemo(() => {
    if (dbFaqs.length > 0) return dbFaqs
    return FALLBACK_FAQS
  }, [dbFaqs])

  const categories = useMemo(() => {
    const set = new Set<string>()
    faqs.forEach((f) => { if (f.category) set.add(f.category) })
    return ["all", ...Array.from(set)]
  }, [faqs])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return faqs.filter((f) => {
      const matchCat = activeCategory === "all" || f.category === activeCategory
      const matchSearch = !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [faqs, search, activeCategory])

  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-28 pb-12 sm:pt-32 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.06),transparent_50%)]" />
        <div className="container relative z-10 mx-auto px-4 sm:px-6 max-w-3xl">
          <Link
            href="/feedback"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition mb-6"
          >
            <ArrowLeft size={16} />
            Voltar ao Feedback
          </Link>
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-3 mb-4">
            <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
              <HelpCircle size={24} />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-4xl font-bold text-white">Dúvidas Frequentes</h1>
              <p className="text-white/50 text-sm sm:text-base mt-1">
                Solucione suas dúvidas com nosso FAQ.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-6">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por dúvida..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-purple-500/40"
            />
          </div>

          {/* Category filters */}
          {categories.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeCategory === cat
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20"
                    }`}
                >
                  {cat === "all" ? "Todas" : cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ List */}
      <section className="pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/40 text-sm">
                {search ? "Nenhuma dúvida encontrada para essa busca." : "Nenhuma FAQ disponível no momento."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-xl bg-white/[0.03] border border-white/[0.07] overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left group"
                  >
                    <span className="text-sm md:text-base text-white/80 pr-4 group-hover:text-white transition">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedId === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-white/30 shrink-0" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {expandedId === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-4 border-t border-white/[0.05] pt-3">
                          <p className="text-sm text-white/50 leading-relaxed">{faq.answer}</p>
                          {faq.category && (
                            <span className="mt-3 inline-block rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-white/30">
                              {faq.category}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-white/30 text-sm">
              Não encontrou sua dúvida?{" "}
              <Link href="/feedback" className="text-purple-400 hover:text-purple-300 transition underline underline-offset-2">
                Envie uma manifestação
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

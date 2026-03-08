"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Loader2, FileDown, ExternalLink } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { getPageBySlug } from "@/services/page-service"
import type { CustomPage } from "@/types/event"

export default function CustomPageView() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [page, setPage] = useState<CustomPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    getPageBySlug(slug).then((data) => {
      if (data) {
        setPage(data)
      } else {
        setNotFound(true)
      }
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030303] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </main>
    )
  }

  if (notFound || !page) {
    return (
      <main className="min-h-screen bg-[#030303] text-white">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-3xl font-bold mb-3">Página não encontrada</h1>
          <p className="text-white/50 mb-6 text-center">A página que você procura não existe ou foi removida.</p>
          <Link href="/" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition text-sm">
            <ArrowLeft size={16} /> Voltar ao início
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <Navigation />

      {/* Cover image */}
      {page.coverImage && (
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
          <img
            src={page.coverImage}
            alt={page.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030303]/50 to-[#030303]" />
        </div>
      )}

      <section className={`relative ${page.coverImage ? "-mt-16" : "pt-28"} pb-16 sm:pb-24`}>
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Back + meta */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition mb-4"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white">{page.title}</h1>
            {page.description && (
              <p className="mt-3 text-white/50 text-sm sm:text-lg">{page.description}</p>
            )}
            {page.createdAt && (
              <div className="mt-3 flex items-center gap-2 text-xs text-white/25">
                <Calendar size={12} />
                {new Date(page.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            )}
          </div>

          {/* HTML Content */}
          <div
            className="prose prose-invert prose-sm sm:prose-base max-w-none
              prose-headings:text-white prose-p:text-white/70 prose-a:text-purple-400
              prose-strong:text-white prose-img:rounded-xl prose-img:border prose-img:border-white/10"
            dangerouslySetInnerHTML={{ __html: page.htmlContent }}
          />

          {/* Attachments / Downloads */}
          {page.attachments && page.attachments.length > 0 && (
            <div className="mt-10 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                <FileDown size={16} className="text-purple-400" />
                Arquivos para Download
              </h3>
              <div className="space-y-2">
                {page.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 transition hover:border-purple-500/30 hover:bg-purple-500/5"
                  >
                    <div className="shrink-0 rounded-lg bg-purple-500/10 p-2 text-purple-400 group-hover:bg-purple-500/20 transition">
                      {att.type === "link" ? <ExternalLink size={16} /> : <FileDown size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 group-hover:text-white transition truncate">
                        {att.name}
                      </p>
                      {att.size ? (
                        <p className="text-[11px] text-white/30">
                          {att.size < 1024 * 1024
                            ? `${(att.size / 1024).toFixed(0)} KB`
                            : `${(att.size / (1024 * 1024)).toFixed(1)} MB`}
                        </p>
                      ) : att.type === "link" ? (
                        <p className="text-[11px] text-white/30 truncate">{att.url}</p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-purple-400/60 group-hover:text-purple-400 transition">
                      {att.type === "link" ? "Abrir ↗" : "Baixar ↓"}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

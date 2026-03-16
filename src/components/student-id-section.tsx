"use client"

import { memo } from "react"
import Image from "next/image"
import { ArrowUpRight, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

const OPTIONS = [
  {
    id: "id-jovem",
    name: "ID Jovem",
    priceTag: "Gratuito",
    accent: "from-emerald-400/20 via-teal-400/10 to-transparent",
    image: "/assents/images/id_jovem.jpeg",
    description:
      "Identidade digital federal para jovens de 15 a 29 anos com renda familiar de até dois salários mínimos.",
    longDescription:
      "O programa Identidade Jovem garante meia-entrada em eventos culturais e transporte interestadual gratuito ou com desconto (Decreto 8.537/2015).",
    benefits: [
      "50% de desconto em cinemas, shows, teatros e eventos esportivos.",
      "Duas passagens de ônibus interestaduais gratuitas por mês.",
      "Dois assentos adicionais com 50% de desconto quando as vagas gratuitas esgotarem.",
      "Isenção da taxa para a Carteira de Identidade Estudantil oficial.",
      "Documento 100% digital válido em todo o território nacional."
    ],
    ctaLabel: "Solicitar ID Jovem",
    ctaHref: "https://idjovem.juventude.gov.br/",
    footnote: "Requisitos: 15-29 anos, cadastro ativo no CadÚnico, renda familiar ≤2 salários mínimos.",
    badge: "Acesso digital imediato"
  },
  {
    id: "student-card",
    name: "Carteira de Estudante",
    priceTag: "Emissão paga",
    accent: "from-indigo-400/25 via-sky-400/10 to-transparent",
    image: "/assents/images/carteira_estudante.png",
    description:
      "Carteira da UNE/UBES/ANPG reconhecida nacionalmente para meia-entrada e identificação no campus.",
    longDescription:
      "Emitida pelas entidades estudantis nacionais, aceita em todo o Brasil para transporte, shows e eventos culturais. Versão digital e cartão físico opcional.",
    benefits: [
      "Meia-entrada garantida em eventos culturais e esportivos.",
      "Documento legalmente reconhecido com validade anual.",
      "Carteirinha digital imediata e entrega física opcional.",
      "Suporte de parceiros da UNE/UBES/ANPG.",
      "Ótima alternativa se você não se qualifica para o ID Jovem."
    ],
    ctaLabel: "Solicitar carteira",
    ctaHref:
      "https://ciedigitalnacional.com.br/?gad_source=1&gad_campaignid=23278613972&gbraid=0AAAABB9fGhZ-g6CzBPCH_zp0LmRdgeNDQ&gclid=Cj0KCQiA6Y7KBhCkARIsAOxhqtNj28vAqcpoWKI9c28zJuATMephVU4xEom4f6EPg8-O2xhX_xP7KiAaAgMMEALw_wcB",
    footnote: "Taxa anual cobrada por parceiros. Verifique preços, prazos e frete antes de solicitar.",
    badge: "Digital + Físico"
  }
] as const

const BENEFITS = [
  {
    id: "office365",
    title: "Microsoft 365 Education",
    badge: "Grátis com email do IFBA",
    description:
      "Word, Excel, PowerPoint, Teams e Copilot Chat para todos os alunos verificados.",
    highlights: [
      "Crie, colabore e apresente diretamente no navegador.",
      "1 TB no OneDrive vinculado à conta institucional.",
      "IA para acelerar pesquisas e trabalhos."
    ],
    link: "https://www.microsoft.com/education/products/office",
    cta: "Ativar Microsoft 365"
  },
  {
    id: "canva",
    title: "Canva para Estudantes",
    badge: "Ferramentas de Design",
    description:
      "Modelos premium, kits de marca para apresentações, pôsteres e projetos.",
    highlights: [
      "Modelos, fontes e banco de imagens Pro.",
      "Exporte para impressão com um clique.",
      "Colaboração em tempo real para grupos."
    ],
    link: "https://www.canva.com/education/students/",
    cta: "Resgatar acesso Canva"
  },
  {
    id: "jetbrains",
    title: "JetBrains Student Pack",
    badge: "IDEs Profissionais",
    description:
      "IDEs de nível industrial (IntelliJ, PyCharm, WebStorm e mais) grátis enquanto matriculado.",
    highlights: [
      "Autocompletar inteligente e refatoração.",
      "Suporte para Spring, Django, React e mais.",
      "Licença vinculada ao email de estudante."
    ],
    link: "https://www.jetbrains.com/academy/student-pack/",
    cta: "Desbloquear JetBrains"
  },
  {
    id: "github",
    title: "GitHub Education",
    badge: "GitHub Pro + extras",
    description:
      "GitHub Pro, Copilot Pro, Codespaces e Actions grátis para estudantes.",
    highlights: [
      "Repos privados ilimitados.",
      "3k min Actions + 180h Codespaces/mês.",
      "Copilot Pro incluído no editor."
    ],
    link: "https://github.com/education/students",
    cta: "Entrar no GitHub Education"
  }
] as const

/* ─── Mobile compact card for credentials ─── */
const MobileCredentialCard = memo(function MobileCredentialCard({ option }: { option: typeof OPTIONS[number] }) {
  return (
    <Dialog>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <div className="flex items-start gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
            <Image
              src={option.image}
              alt={option.name}
              fill
              sizes="56px"
              className="object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                {option.priceTag}
              </span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                {option.badge}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white">{option.name}</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/50 line-clamp-2">{option.description}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-white/15 text-white/80 bg-white/5 hover:bg-white/10 text-xs h-9"
            >
              Ver benefícios
            </Button>
          </DialogTrigger>
          <Button asChild size="sm" className="flex-1 bg-emerald-500/90 hover:bg-emerald-400 text-white text-xs h-9">
            <a href={option.ctaHref} target="_blank" rel="noreferrer">
              {option.ctaLabel}
            </a>
          </Button>
        </div>
      </div>

      <DialogContent className="bg-[#0c0c10] border-white/10 text-white sm:max-w-xl w-[92vw]">
        <DialogHeader>
          <DialogTitle className="text-xl">{option.name}</DialogTitle>
          <DialogDescription className="text-white/70 text-sm leading-relaxed">
            {option.longDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3">
            {option.benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 text-sm text-white/85">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={16} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/50">{option.footnote}</p>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="ghost" className="text-white/80 hover:bg-white/5">Fechar</Button>
          </DialogClose>
          <Button asChild className="bg-emerald-500/90 hover:bg-emerald-400 text-white">
            <a href={option.ctaHref} target="_blank" rel="noreferrer">{option.ctaLabel}</a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

/* ─── Desktop card for credentials ─── */
const DesktopCredentialCard = memo(function DesktopCredentialCard({ option }: { option: typeof OPTIONS[number] }) {
  return (
    <Dialog>
      <Card className="relative flex h-full flex-col overflow-hidden bg-white/5 border-white/10 backdrop-blur-md rounded-3xl">
        <div className={`absolute inset-0 bg-gradient-to-br ${option.accent}`} />
        <div className="relative flex flex-1 flex-col p-6">
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 aspect-[4/3]">
              <Image
                src={option.image}
                alt={option.name}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10">
                  {option.priceTag}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-white/70 border border-white/5">
                  {option.badge}
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
                {option.name}
                <ArrowUpRight className="text-white/50" size={18} />
              </h3>
              <p className="text-white/70 text-base leading-relaxed">
                {option.description}
              </p>
            </div>
          </div>

          {/* mt-auto forces buttons to bottom regardless of description height */}
          <div className="mt-auto flex flex-row gap-3 pt-5">
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-auto border-white/80 text-white/95 bg-white/5 hover:bg-white/15 backdrop-blur text-sm py-2"
              >
                Ver benefícios
              </Button>
            </DialogTrigger>
            <Button asChild className="w-auto bg-emerald-500/90 hover:bg-emerald-400 text-white text-sm py-2">
              <a href={option.ctaHref} target="_blank" rel="noreferrer">
                {option.ctaLabel}
              </a>
            </Button>
          </div>
        </div>
      </Card>

      <DialogContent className="bg-[#0c0c10] border-white/10 text-white sm:max-w-xl w-[92vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{option.name}</DialogTitle>
          <DialogDescription className="text-white/70 text-sm leading-relaxed">
            {option.longDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3">
            {option.benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 text-sm text-white/85">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={18} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/50">{option.footnote}</p>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="ghost" className="text-white/80 hover:bg-white/5">Fechar</Button>
          </DialogClose>
          <Button asChild className="bg-emerald-500/90 hover:bg-emerald-400 text-white">
            <a href={option.ctaHref} target="_blank" rel="noreferrer">{option.ctaLabel}</a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

/* ─── Compact benefit card for mobile ─── */
const MobileBenefitCard = memo(function MobileBenefitCard({ benefit }: { benefit: typeof BENEFITS[number] }) {
  return (
    <Card className="relative p-4 bg-white/[0.03] border-white/[0.08] rounded-2xl">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">{benefit.badge}</p>
          <h3 className="text-sm font-semibold text-white mt-1">{benefit.title}</h3>
        </div>
        <Button
          asChild
          size="sm"
          className="shrink-0 bg-emerald-500/80 hover:bg-emerald-500 text-white text-[11px] h-8 px-3"
        >
          <a href={benefit.link} target="_blank" rel="noreferrer">
            {benefit.cta}
          </a>
        </Button>
      </div>
      <p className="text-white/55 text-xs leading-relaxed mb-3 line-clamp-2">{benefit.description}</p>
      <div className="space-y-1.5">
        {benefit.highlights.map((highlight) => (
          <div key={highlight} className="flex items-start gap-2 text-xs text-white/70">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={12} />
            <span>{highlight}</span>
          </div>
        ))}
      </div>
    </Card>
  )
})

/* ─── Desktop benefit card ─── */
const DesktopBenefitCard = memo(function DesktopBenefitCard({ benefit }: { benefit: typeof BENEFITS[number] }) {
  return (
    <Card className="relative flex h-full flex-col p-6 bg-white/5 border-white/10 backdrop-blur rounded-3xl">
      <div className="flex flex-row items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">{benefit.badge}</p>
          <h3 className="text-2xl font-semibold text-white mt-2">{benefit.title}</h3>
        </div>
        <Button
          asChild
          size="sm"
          className="w-auto whitespace-nowrap bg-emerald-500/80 hover:bg-emerald-500 text-white text-sm"
        >
          <a href={benefit.link} target="_blank" rel="noreferrer">
            {benefit.cta}
          </a>
        </Button>
      </div>

      <p className="text-white/70 text-sm leading-relaxed mb-4">{benefit.description}</p>

      <div className="mt-auto space-y-2">
        {benefit.highlights.map((highlight) => (
          <div key={highlight} className="flex items-start gap-2 text-sm text-white/80">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={14} />
            <span>{highlight}</span>
          </div>
        ))}
      </div>
    </Card>
  )
})

export default function StudentIdSection() {
  return (
    <section
      id="student-id"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#0b0b0f] via-[#06060a] to-[#030303]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(168,85,247,0.08),transparent_40%)]" />
      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8 sm:mb-12">
          <div className="space-y-3 max-w-2xl">
            <p className="text-[11px] sm:text-sm uppercase tracking-[0.2em] text-white/50">Identidade Estudantil</p>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold text-white">
              Escolha a credencial ideal para sua jornada
            </h2>
            <p className="text-white/60 text-sm sm:text-lg">
              Compare o programa gratuito ID Jovem e a carteira nacional de estudante para garantir meia-entrada, benefícios de viagem e identificação no campus.
            </p>
          </div>
          <div className="text-white/50 text-xs sm:text-sm md:text-right space-y-1">
            <p>Links oficiais reunidos pelo D.A. do IFBA.</p>
            <p>Atualizado para o ano letivo de <span>{new Date().getFullYear()}</span></p>

          </div>
        </div>

        {/* ── Mobile: compact stacked cards (no scroll, all visible) ── */}
        <div className="flex flex-col gap-3 lg:hidden">
          {OPTIONS.map((option) => (
            <MobileCredentialCard key={option.id} option={option} />
          ))}
        </div>

        {/* ── Desktop: side-by-side grid with aligned buttons ── */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
          {OPTIONS.map((option) => (
            <DesktopCredentialCard key={option.id} option={option} />
          ))}
        </div>

        <div className="mt-12 sm:mt-20 space-y-5 sm:space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/50">Central de Benefícios</p>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold text-white">Vantagens exclusivas desbloqueadas pelo seu email IFBA</h2>
              <p className="text-white/60 text-sm sm:text-lg">
                Use sua conta institucional para ativar softwares premium, copilotos de IA, suítes de design e ambientes de desenvolvimento em nuvem sem custo.
              </p>
            </div>
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/60 text-xs sm:text-sm">
              Mais benefícios em breve
            </span>
          </div>

          {/* ── Mobile: uniform stacked grid (2 cols, equal height) ── */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {BENEFITS.map((benefit) => (
              <MobileBenefitCard key={benefit.id} benefit={benefit} />
            ))}
          </div>

          {/* ── Desktop: 2-col grid with equal height ── */}
          <div className="hidden md:grid md:grid-cols-2 md:gap-6">
            {BENEFITS.map((benefit) => (
              <DesktopBenefitCard key={benefit.id} benefit={benefit} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

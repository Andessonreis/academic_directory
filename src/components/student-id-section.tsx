"use client"

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
    name: "Carteira de Estudante Oficial",
    priceTag: "Emissão paga",
    accent: "from-indigo-400/25 via-sky-400/10 to-transparent",
    image: "/assents/images/carteira_estudante.png",
    description:
      "Carteira da UNE/UBES/ANPG reconhecida nacionalmente para benefícios de meia-entrada e identificação no campus.",
    longDescription:
      "Emitida pelas entidades estudantis nacionais, aceita em todo o Brasil para transporte, shows e eventos culturais. Versão digital e cartão físico opcional.",
    benefits: [
      "Meia-entrada garantida em eventos culturais e esportivos.",
      "Documento legalmente reconhecido com validade anual.",
      "Carteirinha digital imediata e entrega física opcional.",
      "Suporte de parceiros da UNE/UBES/ANPG.",
      "Ótima alternativa se você não se qualifica para o ID Jovem."
    ],
    ctaLabel: "Solicitar carteira de estudante",
    ctaHref:
      "https://ciedigitalnacional.com.br/?gad_source=1&gad_campaignid=23278613972&gbraid=0AAAABB9fGhZ-g6CzBPCH_zp0LmRdgeNDQ&gclid=Cj0KCQiA6Y7KBhCkARIsAOxhqtNj28vAqcpoWKI9c28zJuATMephVU4xEom4f6EPg8-O2xhX_xP7KiAaAgMMEALw_wcB",
    footnote: "Taxa anual cobrada por parceiros. Verifique preços, prazos e frete antes de solicitar.",
    badge: "Digital + Físico"
  }
]

const BENEFITS = [
  {
    id: "office365",
    title: "Microsoft 365 Education",
    badge: "Grátis com email do IFBA",
    description:
      "Acesso completo ao Word, Excel, PowerPoint, OneNote, Microsoft Teams e Microsoft 365 Copilot Chat para todos os alunos verificados.",
    highlights: [
      "Crie, colabore e apresente diretamente no navegador.",
      "1 TB de armazenamento no OneDrive vinculado à sua conta institucional.",
      "Assistência com IA para acelerar pesquisas e trabalhos."
    ],
    link: "https://www.microsoft.com/education/products/office",
    cta: "Ativar Microsoft 365"
  },
  {
    id: "canva",
    title: "Canva para Estudantes",
    badge: "Ferramentas de Design",
    description:
      "Modelos premium, kits de marca e ferramentas de colaboração para aprimorar apresentações, pôsteres, portfólios e projetos extracurriculares.",
    highlights: [
      "Acesso a modelos, fontes e banco de imagens Pro.",
      "Agende posts sociais ou exporte arquivos para impressão com um clique.",
      "Colaboração em tempo real para grupos de classe e clubes."
    ],
    link: "https://www.canva.com/education/students/",
    cta: "Resgatar acesso Canva"
  },
  {
    id: "jetbrains",
    title: "JetBrains Student Pack",
    badge: "Suíte de IDEs Profissionais",
    description:
      "Use IDEs de nível industrial (IntelliJ IDEA, PyCharm, PhpStorm, GoLand, Rider, CLion, RustRover, WebStorm, RubyMine, DataGrip, DataSpell, ReSharper) gratuitamente enquanto estiver matriculado.",
    highlights: [
      "Ferramentas específicas por linguagem com autocompletar inteligente e refatoração.",
      "Suporte integrado para Spring, Django, Laravel, React, SQL, Jupyter e mais.",
      "Licenciamento local ou baseado em nuvem vinculado ao seu email de estudante."
    ],
    link: "https://www.jetbrains.com/academy/student-pack/",
    cta: "Desbloquear IDEs JetBrains"
  },
  {
    id: "github",
    title: "GitHub Education",
    badge: "GitHub Pro + extras",
    description:
      "GitHub Pro gratuito, Copilot Pro, Codespaces, minutos de Actions, armazenamento de Packages e ofertas de parceiros para construir, aprender e lançar de qualquer lugar.",
    highlights: [
      "Repositórios privados ilimitados com colaboração avançada.",
      "3k minutos de Actions + 180 horas de Codespaces todo mês.",
      "Copilot Pro incluído para programação em par com IA no seu editor."
    ],
    link: "https://github.com/education/students",
    cta: "Entrar no GitHub Education"
  }
]

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
            <p>Atualizado para o ano letivo de 2025.</p>
            <p>Links oficiais curados pelo D.A. do IFBA.</p>
          </div>
        </div>

        <div className="-mx-4 flex flex-row gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4 lg:mx-0 lg:px-0 lg:pb-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:overflow-visible">
          {OPTIONS.map((option) => (
            <Dialog key={option.id}>
              <Card className="relative overflow-hidden bg-white/5 border-white/10 backdrop-blur-md rounded-3xl flex-shrink-0 min-w-[220px] max-w-[280px] lg:min-w-0 lg:max-w-none">
                <div className={`absolute inset-0 bg-gradient-to-br ${option.accent}`} />
                <div className="relative p-3 sm:p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:items-center">
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 h-36m:aspect-[4/3]">
                      <Image
                        src={option.image}
                        alt={option.name}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-sm">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/10">
                          {option.priceTag}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-white/70 border border-white/5">
                          {option.badge}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-2xl font-semibold text-white flex items-center gap-2">
                        {option.name}
                        <ArrowUpRight className="text-white/50" size={18} />
                      </h3>
                      <p className="text-white/70 text-xs sm:text-base leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-3">
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto border-white/80 text-white/95 bg-white/5 hover:bg-white/15 backdrop-blur text-sm py-2"
                      >
                        Ver benefícios
                      </Button>


                    </DialogTrigger>
                    <Button asChild className="w-full sm:w-auto bg-emerald-500/90 hover:bg-emerald-400 text-white text-sm py-2">
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
                        <CheckCircle2 className="mt-0.5 text-emerald-400" size={18} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-white/50">{option.footnote}</p>
                </div>

                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button variant="ghost" className="text-white/80 hover:bg-white/5">
                      Fechar
                    </Button>
                  </DialogClose>
                  <Button asChild className="bg-emerald-500/90 hover:bg-emerald-400 text-white">
                    <a href={option.ctaHref} target="_blank" rel="noreferrer">
                      {option.ctaLabel}
                    </a>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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

          <div className="-mx-4 flex flex-row gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible">
            {BENEFITS.map((benefit) => (
              <Card
                key={benefit.id}
                className="relative h-full p-4 sm:p-6 bg-white/5 border-white/10 backdrop-blur rounded-3xl flex-shrink-0 min-w-[220px] max-w-[280px] md:min-w-0 md:max-w-none"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/40">{benefit.badge}</p>
                    <h3 className="text-lg sm:text-2xl font-semibold text-white mt-2">{benefit.title}</h3>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="w-full sm:w-auto whitespace-nowrap bg-emerald-500/80 hover:bg-emerald-500 text-white text-sm"
                  >
                    <a href={benefit.link} target="_blank" rel="noreferrer">
                      {benefit.cta}
                    </a>
                  </Button>
                </div>

                <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-4">{benefit.description}</p>

                <div className="space-y-2">
                  {benefit.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-start gap-2 text-xs sm:text-sm text-white/80">
                      <CheckCircle2 className="mt-0.5 text-emerald-400" size={14} />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

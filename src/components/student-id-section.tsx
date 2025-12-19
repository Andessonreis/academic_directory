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
      "Carteira digital gratuita do Governo Federal para juventudes de 15 a 29 anos, com renda familiar de até 2 salários mínimos.",
    longDescription:
      "O Programa Identidade Jovem (ID JOVEM) garante meia-entrada em eventos artístico-culturais e esportivos, além de vagas gratuitas ou com desconto no transporte interestadual (Decreto nº 8.537/2015).",
    benefits: [
      "Meia-entrada em cinema, shows, teatros e eventos esportivos.",
      "Duas viagens gratuitas por mês em ônibus interestaduais.",
      "Duas passagens interestaduais com 50% de desconto quando as gratuidades se esgotarem.",
      "Isenção da taxa de emissão de Identidade Estudantil.",
      "Documento 100% digital, válido em todo o país."
    ],
    ctaLabel: "Emitir ID Jovem",
    ctaHref: "https://idjovem.juventude.gov.br/",
    footnote: "Requisitos: 15 a 29 anos, cadastro atualizado no CadÚnico e renda familiar de até 2 salários mínimos.",
    badge: "Digital e instantâneo"
  },
  {
    id: "carteira-estudantil",
    name: "Carteira Estudantil Oficial",
    priceTag: "Assinatura paga",
    accent: "from-indigo-400/25 via-sky-400/10 to-transparent",
    image: "/assents/images/carteira_estudante.png",
    description:
      "Documento estudantil oficial UNE/UBES/ANPG para garantir meia-entrada nacional e identificação no campus.",
    longDescription:
      "Carteira de estudante oficial emitida por entidades nacionais. Aceita em cinemas, shows, transporte e eventos em todo o Brasil, com versão digital e opção de via física.",
    benefits: [
      "Meia-entrada em eventos culturais, esportivos e shows em todo o território nacional.",
      "Documento reconhecido por lei (meia-entrada estudantil) com validade anual.",
      "Versão digital imediata e opção de receber o cartão físico.",
      "Suporte de emissão pela rede UNE/UBES/ANPG.",
      "Ideal para quem não se enquadra nos requisitos do ID Jovem."
    ],
    ctaLabel: "Assinar carteira paga",
    ctaHref:
      "https://ciedigitalnacional.com.br/?gad_source=1&gad_campaignid=23278613972&gbraid=0AAAABB9fGhZ-g6CzBPCH_zp0LmRdgeNDQ&gclid=Cj0KCQiA6Y7KBhCkARIsAOxhqtNj28vAqcpoWKI9c28zJuATMephVU4xEom4f6EPg8-O2xhX_xP7KiAaAgMMEALw_wcB",
    footnote: "Pagamento único anual. Consulte o parceiro sobre valores, prazos e envio da via física.",
    badge: "Versão digital + física"
  }
]

export default function StudentIdSection() {
  return (
    <section
      id="carteirinha"
      className="relative overflow-hidden py-24 bg-gradient-to-b from-[#0b0b0f] via-[#06060a] to-[#030303]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(168,85,247,0.08),transparent_40%)]" />
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
          <div className="space-y-3 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">Carteira do Estudante</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-white">
              Escolha a opção que cabe no seu bolso
            </h2>
            <p className="text-white/60 text-lg">
              Compare o ID Jovem gratuito com a carteira estudantil paga e veja qual faz mais sentido para seu perfil. Ambos garantem meia-entrada e identificação estudantil.
            </p>
          </div>
          <div className="text-white/50 text-sm md:text-right">
            <p>Atualizado para o calendário 2025.</p>
            <p>Informações oficiais e links diretos.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {OPTIONS.map((option) => (
            <Dialog key={option.id}>
              <Card className="relative overflow-hidden bg-white/5 border-white/10 backdrop-blur-md h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${option.accent}`} />
                <div className="relative p-6 flex flex-col gap-6 h-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30 aspect-[4/3]">
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
                      <div className="flex items-center gap-3 text-sm">
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
                      <p className="text-white/70 text-sm leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-auto">
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Ver benefícios
                      </Button>
                    </DialogTrigger>
                    <Button asChild className="bg-emerald-500/90 hover:bg-emerald-400 text-white">
                      <a href={option.ctaHref} target="_blank" rel="noreferrer">
                        {option.ctaLabel}
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>

              <DialogContent className="bg-[#0c0c10] border-white/10 text-white">
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
      </div>
    </section>
  )
}

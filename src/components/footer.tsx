"use client"

import { Instagram, Mail, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black/60 backdrop-blur-xl border-t border-white/10 py-8 sm:py-12 md:py-16 relative overflow-hidden">

      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* CTA + contact — compact on mobile */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-12 gap-4 sm:gap-8">
          <div>
            <h2 className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 sm:mb-2">
              Dúvidas?
            </h2>
            <p className="text-white/60 text-xs sm:text-base">Entre em contato com a gestão.</p>
          </div>

          <div className="text-left sm:text-right">
            <a
              href="mailto:da.irece@ifba.edu.br"
              className="text-sm sm:text-xl md:text-2xl text-white hover:text-purple-400 transition-all duration-300 block mb-2 sm:mb-4"
            >
              da.irece@ifba.edu.br
            </a>

            <div className="flex gap-2.5 sm:gap-4 justify-start sm:justify-end">
              <a aria-label="Instagram" href="#" className="p-2 sm:p-3 bg-white/5 rounded-full hover:bg-purple-600/50 transition-colors border border-white/10">
                <Instagram className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </a>
              <a aria-label="E-mail" href="#" className="p-2 sm:p-3 bg-white/5 rounded-full hover:bg-purple-600/50 transition-colors border border-white/10">
                <Mail className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mb-5 sm:mb-12" />

        {/* Nav + Location — hidden on mobile, shown on sm+ */}
        <div className="hidden sm:grid grid-cols-2 lg:flex lg:flex-row lg:justify-between items-start gap-8">
          <nav className="flex flex-col gap-2 sm:gap-3">
            <h3 className="text-purple-400 font-bold mb-2 uppercase tracking-wider text-sm">Navegação</h3>
            {[
              { name: "Início", href: "/" },
              { name: "Eventos", href: "/#eventos" },
              { name: "Calendário Acadêmico", href: "/calendario" },
              { name: "Gestão & Time", href: "/team" },
              { name: "Central do Estudante", href: "/student-id" },
            ].map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white/70 hover:text-white transition-all duration-300 text-sm sm:text-base flex items-center gap-2"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-4 text-white/60">
            <h3 className="text-purple-400 font-bold mb-2 uppercase tracking-wider text-sm">Localização</h3>
            <div className="flex items-start gap-3 max-w-xs">
              <MapPin className="w-5 h-5 mt-1 shrink-0 text-purple-500" />
              <p>IFBA Campus Irecê <br /> Rodovia BA-148, Km 04, nº 1800 <br /> Vila Esperança, Irecê - BA</p>
            </div>
          </div>
        </div>

        {/* Mobile: minimal inline links */}
        <div className="flex sm:hidden flex-wrap gap-x-4 gap-y-1 text-xs text-white/40 mb-4">
          <a href="/" className="hover:text-white/70 transition">Início</a>
          <a href="/#eventos" className="hover:text-white/70 transition">Eventos</a>
          <a href="/calendario" className="hover:text-white/70 transition">Calendário</a>
          <a href="/team" className="hover:text-white/70 transition">Time</a>
          <a href="/community" className="hover:text-white/70 transition">Comunidade</a>
        </div>

        {/* Copyright */}
        <div
          className="mt-6 sm:mt-16 pt-4 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4"
        >
          <p className="text-white/40 text-[10px] sm:text-sm">
            © 2025 Diretório Acadêmico. Feito por estudantes, para estudantes.
          </p>
          <p className="text-white/60 text-[10px] sm:text-xs">
            Desenvolvido por <a href="https://andessonreis.vercel.app" className="underline hover:text-purple-400 transition-colors">Andesson Reis</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

"use client"

import { motion } from "framer-motion"
import { Instagram, Mail, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black/60 backdrop-blur-xl border-t border-white/10 py-16 relative overflow-hidden">

      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-2">
              Dúvidas?
            </h2>
            <p className="text-white/60 text-lg">Entre em contato com a gestão.</p>
          </motion.div>

          <motion.div
            className="text-left lg:text-right"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.a
              href="mailto:da.irece@ifba.edu.br"
              className="text-2xl md:text-3xl lg:text-4xl text-white hover:text-purple-400 transition-all duration-300 block mb-4"
              whileHover={{
                scale: 1.02,
                textShadow: "0 0 20px rgba(168, 85, 247, 0.5)",
              }}
            >
              da.irece@ifba.edu.br
            </motion.a>

            <div className="flex gap-4 justify-start lg:justify-end">
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-purple-600/50 transition-colors border border-white/10">
                <Instagram className="w-6 h-6 text-white" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-purple-600/50 transition-colors border border-white/10">
                <Mail className="w-6 h-6 text-white" />
              </a>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-white/10 mb-12" />

        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">

          {/* Navegação Rápida */}
          <motion.nav
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-purple-400 font-bold mb-2 uppercase tracking-wider text-sm">Navegação</h3>
            {[
              { name: "Início", href: "/" },
              { name: "Eventos", href: "#eventos" },
              { name: "Calendário Acadêmico", href: "#calendario" },
              { name: "Gestão & Time", href: "#time" },
              { name: "Documentos", href: "#docs" },
            ].map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="text-white/70 hover:text-white transition-all duration-300 text-base flex items-center gap-2"
                whileHover={{ x: 5, color: "#fff" }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {link.name}
              </motion.a>
            ))}
          </motion.nav>

          {/* Endereço e Info */}
          <motion.div
            className="flex flex-col gap-4 text-white/60"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-purple-400 font-bold mb-2 uppercase tracking-wider text-sm">Localização</h3>
            <div className="flex items-start gap-3 max-w-xs">
              <MapPin className="w-5 h-5 mt-1 shrink-0 text-purple-500" />
              <p>IFBA Campus Irecê <br /> Rodovia BA-148, Km 04, nº 1800 <br /> Vila Esperança, Irecê - BA</p>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <p className="text-white/40 text-sm">
            © 2025 Diretório Acadêmico. Feito por estudantes, para estudantes.
          </p>
          <p className="text-white/60 text-xs">
            Desenvolvido por <a href="https://andessonreis.vercel.app" className="underline hover:text-purple-400 transition-colors">Andesson Reis</a>
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

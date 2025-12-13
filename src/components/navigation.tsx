"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface NavItem {
  label: string
  href: string
  isExternal?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: "Eventos", href: "#eventos" },
  { label: "Calendário", href: "#calendario" },
  { label: "Time", href: "/team" },
  { label: "Contato", href: "#contato", isExternal: true },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${scrolled || isOpen
        ? "bg-[#030303]/90 backdrop-blur-md border-white/[0.08]"
        : "bg-transparent border-transparent"
        }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">

          <Link href="/" className="flex items-center gap-3 group">

            <div className="h-10 bg-white rounded-md p-1.5 flex items-center justify-center group-hover:bg-gray-100 transition-colors shadow-lg shadow-white/5">
              <img
                src="/logo-hopper-ifba.png"
                alt="Logo Hopper IFBA"
                className="h-full w-auto object-contain"
              />
            </div>

          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/[0.08] bg-[#030303] overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {NAV_ITEMS.map((item, idx) => (
                <MobileNavLink
                  key={item.label}
                  item={item}
                  index={idx}
                  onClick={() => setIsOpen(false)}
                />
              ))}

              <div className="pt-4 border-t border-white/[0.08] mt-2">
                <button className="w-full py-3 px-4 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all text-sm font-medium">
                  Book a call
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

function NavLink({ item }: { item: NavItem }) {
  return (
    <a
      href={item.href}
      className="text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1 group"
    >
      {item.label}
      {item.isExternal && (
        <ArrowUpRight
          size={14}
          className="opacity-50 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
        />
      )}
    </a>
  )
}

function MobileNavLink({ item, index, onClick }: { item: NavItem; index: number; onClick: () => void }) {
  return (
    <motion.a
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      href={item.href}
      onClick={onClick}
      className="text-lg font-medium text-white/80 hover:text-white py-2 flex items-center gap-2"
    >
      {item.label}
      {item.isExternal && <ArrowUpRight size={18} className="opacity-50" />}
    </motion.a>
  )
}

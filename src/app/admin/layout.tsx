"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar se há usuário autenticado
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          redirect("/sign-in")
          return
        }

        // Verificar se o usuário é admin
        const { data: userRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single()

        if (userRole?.role !== "admin") {
          redirect("/")
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error("Erro ao verificar autorização:", error)
        redirect("/sign-in")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-purple-500" size={40} />
          <p className="text-white/60">Verificando autorização...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Acesso Negado</h1>
          <p className="text-white/60">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

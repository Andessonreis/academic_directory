"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

interface SignInCredentials {
  email: string
  password: string
}

interface UseSignInReturn {
  signIn: (credentials: SignInCredentials) => Promise<void>
  isLoading: boolean
  error: string | null
}

export function useSignIn(): UseSignInReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const signIn = async ({ email, password }: SignInCredentials) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      // Redirect to dashboard on success
      router.push("/admin/dashboard")
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError(err.message || "Erro ao fazer login. Verifique suas credenciais.")
    } finally {
      setIsLoading(false)
    }
  }

  return { signIn, isLoading, error }
}

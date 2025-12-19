"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"
//import { FcGoogle } from "react-icons/fc"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useSignIn } from "@/hooks/use-sign-in"
import { supabase } from "@/lib/supabase/client"
import PixelBlast from "@/components/PixelBlast"

export function SignInClientPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { signIn, isLoading, error } = useSignIn()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn({ email, password })
  }


  return (
    <div className="min-h-screen w-full bg-[#030303] flex relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none mix-blend-screen">
        <PixelBlast
          variant="circle"
          pixelSize={3}
          color="#6d28d9"
          patternScale={12}
          patternDensity={0.15}
          pixelSizeJitter={0.3}
          enableRipples={true}
          rippleSpeed={0.15}
          rippleThickness={0.03}
          rippleIntensityScale={0.6}
          liquid={true}
          liquidStrength={0.08}
          liquidRadius={0.9}
          liquidWobbleSpeed={0.4}
          speed={0.15}
          edgeFade={0.7}
          transparent={true}
        />
      </div>

      <div className="fixed inset-0 z-[1] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900/10 via-[#030303]/50 to-[#030303] pointer-events-none" />

      {/* Left Panel - Logo & Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f1a] via-[#1a1625] to-[#0a0a0f]" />

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
              animation: "gridMove 20s linear infinite",
            }}
          />
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-16">
          <div className="mb-12 relative group">
            <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <Image
              src="/assents/images/auth/MARCA_IFBA_CAMPUS_VERTICAL_CMYK_IRECE.png"
              alt="IFBA - Campus Irecê"
              width={280}
              height={280}
              className="object-contain relative z-10 drop-shadow-2xl"
              priority
            />
          </div>

          {/* Text */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Diretório Acadêmico
            </h2>
            <p className="text-gray-400 text-sm font-medium tracking-wide">IFBA - Gestão 2025-2026</p>
          </div>

          <div className="mt-16 flex items-center gap-2">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="w-2 h-2 rounded-full bg-purple-500/50 animate-pulse" />
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          </div>

          {/* Tech Indicator */}
          <div className="mt-8 flex items-center gap-2 text-xs text-gray-600">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono">Sistema Seguro</span>
          </div>
        </div>

        {/* Corner Accent */}
        <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-purple-500/20" />
        <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-purple-500/20" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-[440px] space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <Image
              src="/assents/images/auth/MARCA_IFBA_CAMPUS_VERTICAL_CMYK_IRECE.png"
              alt="IFBA"
              width={120}
              height={120}
              className="object-contain mb-4 drop-shadow-2xl"
              priority
            />
            <h2 className="text-xl font-bold text-white">Diretório Acadêmico</h2>
            <p className="text-gray-500 text-xs mt-1">IFBA - Gestão 2025-2026</p>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">Bem-vindo de volta</h1>
            <p className="text-sm text-gray-500">Insira suas credenciais para acessar o painel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </Label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#13131a]/80 backdrop-blur-sm border border-gray-800 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                Senha
              </Label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 bg-[#13131a]/80 backdrop-blur-sm border border-gray-800 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer font-normal">
                  Lembrar-me
                </Label>
              </div>
              <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Esqueceu a senha?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                "Entrar no Painel"
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs">
              </div>
            </div>
            {/* Social Login (Google) */}
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-600 pt-4">Acesso restrito aos membros do Diretório Acadêmico</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>
    </div>
  )
}

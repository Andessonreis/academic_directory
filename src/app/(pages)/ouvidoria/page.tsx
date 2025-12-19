"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageSquare, Send, AlertCircle, CheckCircle2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const COMPLAINT_TYPES = [
  { value: "elogio", label: "🌟 Elogio" },
  { value: "sugestao", label: "💡 Sugestão" },
  { value: "reclamacao", label: "⚠️ Reclamação" },
  { value: "denuncia", label: "🚨 Denúncia" },
  { value: "outro", label: "📝 Outro" }
]

export default function OuvidoriaPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "sugestao" as string,
    subject: "",
    message: "",
    anonymous: false
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // TODO: Implementar envio para backend
      console.log("Formulário enviado:", formData)

      // Simulando envio
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSubmitted(true)
      setFormData({
        name: "",
        email: "",
        type: "sugestao",
        subject: "",
        message: "",
        anonymous: false
      })

      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setError("Erro ao enviar mensagem. Tente novamente.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0a0a0a] pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <MessageSquare size={32} className="text-blue-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ouvidoria
            </h1>
            <p className="text-white/60 text-lg">
              Sua voz importa! Compartilhe sugestões, elogios, reclamações e denúncias com a gente.
            </p>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
          >
            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40 transition-all">
              <div className="text-2xl mb-2">🌟</div>
              <h3 className="text-white font-semibold mb-1">Transparência</h3>
              <p className="text-sm text-white/60">Todos os canais estão abertos para sua participação</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="text-white font-semibold mb-1">Confidencialidade</h3>
              <p className="text-sm text-white/60">Você pode fazer denúncias de forma anônima</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:border-green-500/40 transition-all">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="text-white font-semibold mb-1">Rápido</h3>
              <p className="text-sm text-white/60">Resposta ágil da administração</p>
            </Card>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type */}
                <div>
                  <Label className="text-white/80 mb-2 block">
                    Tipo de Mensagem *
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      {COMPLAINT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-white/80 mb-2 block">
                      Seu Nome {!formData.anonymous && "*"}
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required={!formData.anonymous}
                      disabled={formData.anonymous}
                      className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white/80 mb-2 block">
                      Seu Email {!formData.anonymous && "*"}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required={!formData.anonymous}
                      disabled={formData.anonymous}
                      className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                      placeholder="seu.email@ifba.edu.br"
                    />
                  </div>
                </div>

                {/* Anonymous Checkbox */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.anonymous}
                    onChange={(e) => setFormData(prev => ({ ...prev, anonymous: e.target.checked }))}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <Label htmlFor="anonymous" className="text-white/80 cursor-pointer text-sm">
                    Enviar de forma anônima
                  </Label>
                </div>

                {/* Subject */}
                <div>
                  <Label htmlFor="subject" className="text-white/80 mb-2 block">
                    Assunto *
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    required
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Resuma o assunto em poucas palavras"
                    maxLength={100}
                  />
                  <p className="text-xs text-white/40 mt-1">{formData.subject.length}/100</p>
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message" className="text-white/80 mb-2 block">
                    Mensagem *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    className="bg-white/5 border-white/10 text-white min-h-[150px]"
                    placeholder="Compartilhe seus detalhes aqui..."
                    maxLength={1000}
                  />
                  <p className="text-xs text-white/40 mt-1">{formData.message.length}/1000</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400">
                    <AlertCircle size={18} />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Success Message */}
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-green-400"
                  >
                    <CheckCircle2 size={20} />
                    <span>✓ Mensagem enviada com sucesso! Obrigado por sua participação.</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || submitted}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin mr-2 w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Perguntas Frequentes</h2>
            <div className="space-y-4">
              <Card className="p-4 bg-white/5 border-white/10">
                <h3 className="text-white font-semibold mb-2">O que é a Ouvidoria?</h3>
                <p className="text-white/60 text-sm">
                  A Ouvidoria é um canal de comunicação aberto para ouvir seus elogios, sugestões, reclamações e denúncias. Seu objetivo é melhorar continuamente os serviços prestados.
                </p>
              </Card>
              <Card className="p-4 bg-white/5 border-white/10">
                <h3 className="text-white font-semibold mb-2">Posso enviar de forma anônima?</h3>
                <p className="text-white/60 text-sm">
                  Sim! Você tem total liberdade de enviar uma mensagem de forma anônima, sem precisar fornecer nome ou email. Sua privacidade é importante para nós.
                </p>
              </Card>
              <Card className="p-4 bg-white/5 border-white/10">
                <h3 className="text-white font-semibold mb-2">Qual é o tempo de resposta?</h3>
                <p className="text-white/60 text-sm">
                  Nos comprometemos em responder todas as mensagens dentro de 5 dias úteis. Casos urgentes ou denúncias podem ter prioridade maior.
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  )
}

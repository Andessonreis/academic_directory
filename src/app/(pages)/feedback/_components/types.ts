import type React from "react"

export type FeedbackType = "reclamacao" | "sugestao" | "denuncia" | "elogio"

export interface FeedbackOption {
  id: FeedbackType
  label: string
  icon: React.ReactNode
  color: string
  description: string
}

export interface FormData {
  name: string
  email: string
  message: string
}

export interface FaqItem {
  question: string
  answer: string
}
